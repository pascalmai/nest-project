import { Injectable, Logger } from '@nestjs/common';
import { SportclubRepository } from '../repositories/sportclub.repository';
import { concatMap, forkJoin, from, map, Observable, of, tap } from 'rxjs';
import { SportclubEntity } from '../entities/sportclub.entity';
import { CreateCustomerDto, GetCustomersDto } from '../customer.dto';
import { throwNotFoundError } from '../../../shared/errors';
import cloneDeep from 'lodash/cloneDeep';
import { setIfDefined, stringToBoolean } from '../../../shared/services';
import { OkResponseDto } from '../../../shared/dto';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import { AddressEntity } from '../../address/address.entity';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import { SportclubContactEntity } from '../entities/sportclub-contact.entity';
import { SportclubContactService } from './sportclub-contact.service';
import has from 'lodash/has';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    private readonly sportclubRepository: SportclubRepository,
    private readonly sportclubContactService: SportclubContactService,
  ) {}

  findMany(params: GetCustomersDto): Observable<SportclubEntity[]> {
    const { isDeleted: isDeletedStr } = params;

    const isDeleted = stringToBoolean(isDeletedStr);

    const where = { isDeleted };

    return from(
      this.sportclubRepository.find({
        where,
        relations: ['invoiceAddress', 'shippingAddress'],
      }),
    ).pipe(
      map((entities) =>
        entities.map((entity) => CustomerService.adjustCustomerNumber(entity)),
      ),
    );
  }

  findOne(id: string): Observable<SportclubEntity> {
    return from(
      this.sportclubRepository.findOne({
        where: { id },
        relations: ['invoiceAddress', 'shippingAddress', 'contacts'],
      }),
    ).pipe(map((entity) => CustomerService.adjustCustomerNumber(entity)));
  }

  create(
    payload: any,
    photos: Array<Express.Multer.File>,
  ): Observable<SportclubEntity> {
    const { contacts = [], shippingAddress, invoiceAddress, ...rest } = payload;

    const contactsList = isArray(contacts)
      ? contacts.map((c) => JSON.parse(c))
      : [JSON.parse(contacts)];
    const invoiceAddressObject = JSON.parse(invoiceAddress);
    const shippingAddressObject = JSON.parse(shippingAddress);

    const entity = this.sportclubRepository.create({
      ...rest,
      invoiceAddress: invoiceAddressObject,
      shippingAddress: shippingAddressObject,
    } as CreateCustomerDto);

    this.logger.log('create customer (sport club) entity', { entity });
    this.logger.log('create customer (sport club) contact list', {
      contactsList,
    });
    this.logger.log('create customer (sport club) photos', {
      photos,
    });

    return this.saveCustomersAndContacts(entity, contactsList, photos);
  }

  saveCustomersAndContacts(
    entity: SportclubEntity,
    contactsList: any[],
    photos: any[],
  ) {
    return from(this.sportclubRepository.save(entity)).pipe(
      concatMap((savedCustomer) => {
        const contactsToSave = contactsList.map(
          (contact) =>
            ({
              sportclubId: savedCustomer.id,
              email: contact.email,
              phone: contact.phone,
              fullName: contact.fullName,
              photo: get(photos, `[${contact.photoIndex}].filename`),
            } as SportclubContactEntity),
        );

        this.logger.log('create customer (sport club) contact person entity', {
          entity,
        });

        return forkJoin([
          of(savedCustomer),
          this.sportclubContactService.saveContacts(contactsToSave),
        ]);
      }),
      concatMap(([customer]) => of(customer)),
    );
  }

  createDefaultSportclub() {
    const sportClub = {
      name: 'Matthias',
      jakoCustomerNumber: 'TEMP_55351349',
      invoiceAddress: {
        street: 'Ekkehardstraße',
        houseNumber: '31/2',
        postalCode: '78315',
        city: 'Radolfzell am Bodensee',
      },
      shippingAddress: {
        street: 'Ekkehardstraße',
        houseNumber: '31/2',
        postalCode: '78315',
        city: 'Radolfzell am Bodensee',
      },
      discount: 10,
    };

    const entity = this.sportclubRepository.create(sportClub);

    const contacts = [
      {
        fullName: 'Matthias Koschorrek',
        phone: '+275448960789',
        email: 'math.kos@gamil.com',
        photoIndex: null,
      },
    ];

    return this.saveCustomersAndContacts(entity, contacts, []);
  }

  update(
    id: string,
    payload: any,
    photos: Array<Express.Multer.File>,
  ): Observable<SportclubEntity> {
    const fieldsToUpdate = [
      'name',
      'jakoCustomerNumber',
      'discount',
      'isDeleted',
    ];
    const addressFieldsToUpdate = [
      'addressLine1',
      'addressLine2',
      'street',
      'houseNumber',
      'city',
      'postalCode',
    ];
    const { contacts = [], shippingAddress, invoiceAddress, ...rest } = payload;

    const contactsList = isArray(contacts)
      ? contacts.map((c) => JSON.parse(c))
      : [JSON.parse(contacts)];
    const invoiceAddressObject = invoiceAddress
      ? JSON.parse(invoiceAddress)
      : {};
    const shippingAddressObject = shippingAddress
      ? JSON.parse(shippingAddress)
      : {};

    return from(
      this.sportclubRepository.findOne({
        where: { id },
        relations: ['invoiceAddress', 'shippingAddress', 'contacts'],
      }),
    ).pipe(
      tap(
        (entity) =>
          !entity && throwNotFoundError(`Customer with id '${id}' not found`),
      ),
      concatMap((entity) => {
        const {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          contacts = [],
          invoiceAddress: entityInvoiceAddress,
          shippingAddress: entityShippingAddress,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          invoiceAddressId,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          shippingAddressId,
          ...clonedEntity
        } = cloneDeep(entity);
        const clonedInvoiceAddress = cloneDeep(entityInvoiceAddress) || {};
        const clonedShippingAddress = cloneDeep(entityShippingAddress) || {};

        fieldsToUpdate.forEach((field) => {
          setIfDefined<SportclubEntity>(clonedEntity, rest, field);
        });

        // Special case: when restoring entity, deletedAt should be cleared
        if (has(rest, 'isDeleted') && rest.isDeleted === false) {
          clonedEntity.deletedAt = null;
        }

        // Trying to fill address fields with updated values
        if (!isEmpty(invoiceAddressObject)) {
          addressFieldsToUpdate.forEach((field) => {
            setIfDefined<AddressEntity>(
              clonedInvoiceAddress,
              invoiceAddressObject,
              field,
            );
          });
        }
        if (!isEmpty(shippingAddressObject)) {
          addressFieldsToUpdate.forEach((field) => {
            setIfDefined<AddressEntity>(
              clonedShippingAddress,
              shippingAddressObject,
              field,
            );
          });
        }

        // Update sportclub address only if it was updated actually
        if (!isEqual(clonedInvoiceAddress, entityInvoiceAddress)) {
          clonedEntity['invoiceAddress'] = clonedInvoiceAddress;
        }
        if (!isEqual(clonedShippingAddress, entityShippingAddress)) {
          clonedEntity['shippingAddress'] = clonedShippingAddress;
        }

        const tasks: Observable<any>[] = [];

        if (contactsList) {
          tasks.push(
            this.sportclubContactService.removeOldPhotos(id),
            this.sportclubContactService.deleteSportclubContacts(id),
          );

          const contactsToSave = contactsList.map(
            (contact) =>
              ({
                sportclubId: id,
                email: contact.email,
                phone: contact.phone,
                fullName: contact.fullName,
                photo: get(photos, `[${contact.photoIndex}].filename`),
              } as SportclubContactEntity),
          );

          tasks.push(this.sportclubContactService.saveContacts(contactsToSave));
        }

        tasks.push(from(this.sportclubRepository.save(clonedEntity)));

        return forkJoin(tasks);
      }),
      concatMap(() => this.sportclubRepository.findOne({ id })),
    );
  }

  delete(id: string): Observable<OkResponseDto> {
    return from(this.findOne(id)).pipe(
      tap(
        (entity) =>
          !entity && throwNotFoundError(`Customer with id '${id}' not found`),
      ),
      concatMap(() =>
        this.sportclubRepository.update(
          { id },
          { isDeleted: true, deletedAt: new Date() },
        ),
      ),
      map(() => ({ ok: true })),
    );
  }

  private static adjustCustomerNumber(
    customer: SportclubEntity,
  ): SportclubEntity {
    const customerNumberLength = Number(
      process.env.CUSTOMER_NUMBER_LENGTH || 0,
    );
    const newCustomerNumber = `${customer.customerNumber}`.padStart(
      customerNumberLength,
      '0',
    );
    return {
      ...customer,
      customerNumberString: `${process.env.CUSTOMER_PREFIX}${newCustomerNumber}`,
    };
  }
}
