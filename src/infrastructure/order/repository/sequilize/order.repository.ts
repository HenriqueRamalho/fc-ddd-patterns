import { where } from "sequelize/types";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface  {

  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => {
          const itemJsonRepresentation = item.toJson()
          return {
            id: itemJsonRepresentation.id,
            name: itemJsonRepresentation.name,
            price: itemJsonRepresentation.price,
            product_id: itemJsonRepresentation.productId,
            quantity: itemJsonRepresentation.quantity,
            order_id: entity.id
          }
        }),

      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async find(id: string): Promise<Order> {
    try {
      const orderModel = await OrderModel.findByPk(id, { include:  [ OrderItemModel ], rejectOnEmpty: true})
      const orderItems = orderModel.items.map(item => new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)) 
      
      const order = new Order(orderModel.id, orderModel.customer_id, orderItems)
      return order
    } catch(e) {
      throw new Error("order not found");
    }
  }

  async update(entity: Order): Promise<void> {

    try {
      const sequelize = OrderModel.sequelize
      await sequelize.transaction(async (t) => {
        
        await OrderItemModel.destroy({
          where: { order_id: entity.id },
          transaction: t
        })

        const items = entity.items.map((item) => {
          const itemJsonRepresentation = item.toJson()
          return {
            id: itemJsonRepresentation.id,
            name: itemJsonRepresentation.name,
            price: itemJsonRepresentation.price,
            product_id: itemJsonRepresentation.productId,
            quantity: itemJsonRepresentation.quantity,
            order_id: entity.id
          }
        })

        await OrderItemModel.bulkCreate(items, { transaction: t })

        await OrderModel.update(
          { 
            id: entity.id,
            customer_id: entity.customerId,
            total: entity.total()
           },
          { where: { id: entity.id }, transaction: t }
        )
      })

    } catch(e) {
      throw new Error('Fail to update order')
    }
 
  }

  async findAll(): Promise<Order[]> {

    try {
      const orderModel = await OrderModel.findAll({ include:  [ OrderItemModel ]})
      const orders = orderModel.map(order => {
        const orderItems = order.items.map(item => new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)) 
        const instanceOforder = new Order(order.id, order.customer_id, orderItems)
        return instanceOforder
      })
      
      return orders
    } catch(e) {
      throw new Error("Orders not found");
    }
    
    
  }

}
