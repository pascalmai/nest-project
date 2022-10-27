import { Injectable } from '@nestjs/common';
import { from, map, Observable } from 'rxjs';
import { AdditionalOrderRepository } from './additional-order-line.repository';
import { AdditionalOrderDto } from './additional-order.dto';

@Injectable()
export class AdditionalOrderService {
  constructor(
    private readonly additionalOrderRepository: AdditionalOrderRepository,
  ) {}

  getAll(): Observable<AdditionalOrderDto[]> {
    return from(this.additionalOrderRepository.find());
  }

  createOrders(orders: AdditionalOrderDto[]): Observable<AdditionalOrderDto[]> {
    return from(this.additionalOrderRepository.save(orders));
  }

  getImportedOrderAdditionalOrdersById(id: string) {
    return from(this.additionalOrderRepository.find({ importedOrderId: id }));
  }

  getOrderAdditionalOrdersById(id: string) {
    return from(this.additionalOrderRepository.find({ orderId: id }));
  }

  delete(id: string) {
    return from(this.additionalOrderRepository.delete({ id })).pipe(
      map(() => this.additionalOrderRepository.find()),
    );
  }
}
