import { IsIn } from 'class-validator';
import type { OrderStatus } from '../schemas/order.schema';

/**
 * Supplier updates the order status (confirmed/shipped/cancelled).
 */
export class UpdateOrderStatusDto {
  @IsIn(['confirmed', 'shipped', 'cancelled'])
  status!: OrderStatus;
}
