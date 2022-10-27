import { Injectable } from '@nestjs/common';
import cloneDeep from 'lodash/cloneDeep';
import { concatMap, forkJoin, from, Observable, of, tap } from 'rxjs';
import { FindConditions } from 'typeorm';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import { throwNotFoundError } from '../../../shared/errors';
import { setIfDefined } from '../../../shared/services';
import { SportclubEntity } from '../entities/sportclub.entity';
import { SportclubRepository } from '../repositories/sportclub.repository';
import { SportclubContactService } from './sportclub-contact.service';
import { SportclubContactEntity } from '../entities/sportclub-contact.entity';
import { AddressEntity } from '../../address/address.entity';
import isEqual from 'lodash/isEqual';

@Injectable()
export class SportclubService {
  constructor(
    private readonly sportclubRepository: SportclubRepository,
    private readonly sportclubContactService: SportclubContactService,
  ) {}

  createUserSportclub(ownerId: string): Observable<SportclubEntity> {
    const entity = this.sportclubRepository.create({ ownerId });

    return from(this.sportclubRepository.save(entity));
  }

  findOne(
    conditions: FindConditions<SportclubEntity>,
  ): Observable<SportclubEntity> {
    return from(
      this.sportclubRepository.findOne(conditions, {
        relations: ['contacts', 'invoiceAddress', 'shippingAddress'],
      }),
    );
  }

  update(id: string, payload: any, photos: Array<Express.Multer.File>) {
    const fieldsToUpdate = ['notes'];
    const addressFieldsToUpdate = [
      'addressLine1',
      'addressLine2',
      'street',
      'houseNumber',
      'city',
      'postalCode',
    ];
    const {
      contacts = [],
      invoiceAddress = {},
      shippingAddress = {},
      ...rest
    } = payload;

    const contactsList = isArray(contacts)
      ? contacts.map((c) => JSON.parse(c))
      : [JSON.parse(contacts)];
    const invoiceAddressObject = JSON.parse(invoiceAddress);
    const shippingAddressObject = JSON.parse(shippingAddress);

    return from(this.findOne({ id })).pipe(
      tap(
        (sportclub) =>
          !sportclub && throwNotFoundError(`Sportclub with id ${id} not found`),
      ),
      concatMap((entity) => {
        const {
          contacts = [],
          invoiceAddress: entityInvoiceAddress,
          shippingAddress: entityShippingAddress,
          invoiceAddressId,
          shippingAddressId,
          ...clonedEntity
        } = cloneDeep(entity);
        const clonedInvoiceAddress = cloneDeep(entityInvoiceAddress) || {};
        const clonedShippingAddress = cloneDeep(entityShippingAddress) || {};

        fieldsToUpdate.forEach((field) => {
          setIfDefined<SportclubEntity>(clonedEntity, rest, field);
        });

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
      concatMap(() => this.findOne({ id })),
    );
  }

  findContacts(
    jakoCustomerNumber: string,
  ): Observable<SportclubContactEntity[]> {
    if (!jakoCustomerNumber) {
      return of([]);
    }

    return from(
      this.sportclubRepository.findOne({
        where: {
          jakoCustomerNumber,
          isDeleted: false,
        },
        relations: ['contacts'],
      }),
    ).pipe(concatMap((sportclub) => of(get(sportclub, 'contacts', []))));
  }
}
