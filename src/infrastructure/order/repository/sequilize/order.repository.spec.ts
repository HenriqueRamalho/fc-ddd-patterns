import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );
    const ordemItemJsonRepresentation = ordemItem.toJson()

    const order = new Order("123", "123", [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: ordemItemJsonRepresentation.id,
          name: ordemItemJsonRepresentation.name,
          price: ordemItemJsonRepresentation.price,
          quantity: ordemItemJsonRepresentation.quantity,
          order_id: "123",
          product_id: ordemItemJsonRepresentation.productId,
        },
      ],
    });
  });

  it('Should find a order', async () => {
    const customerRepository = new CustomerRepository();

    const customer = new Customer('123', 'José Silva')
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer)

    const productRepository = new ProductRepository();
    const product = new Product('444', 'product a', 9.85)
    await productRepository.create(product);
    
    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    )

    const order = new Order('888',  customer.id, [ordemItem])
    const orderRepository = new OrderRepository()
    await orderRepository.create(order)
    const recoveredOrder = await orderRepository.find(order.id)

    expect(recoveredOrder.id).toEqual(order.id)
  })


  it('Should update a order', async () => {
    const customerRepository = new CustomerRepository();

    const customer = new Customer('123', 'José Silva')
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer)

    const productRepository = new ProductRepository();
    const product = new Product('555', 'product b', 10)
    await productRepository.create(product);
    
    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      1
    )

    const order = new Order('999',  customer.id, [ordemItem])
    const orderRepository = new OrderRepository()
    await orderRepository.create(order)
    const recoveredOrder = await orderRepository.find(order.id)

    const orderItemB = new OrderItem(
      "2",
      product.name,
      product.price,
      product.id,
      2
    )  

    recoveredOrder.addOrderItem(orderItemB)
    await orderRepository.update(recoveredOrder)
    const recoveredOrderUpdated = await orderRepository.find(order.id)

    expect(recoveredOrderUpdated.total()).toEqual(30)
  })

  it('Should find all orders', async () => {
    const customerRepository = new CustomerRepository();

    const customer = new Customer('123', 'José Silva')
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer)

    const productRepository = new ProductRepository();
    const product = new Product('444', 'product a', 9.85)
    await productRepository.create(product);
    
    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    )
    const order = new Order('1',  customer.id, [ordemItem])
    const orderRepository = new OrderRepository()
    await orderRepository.create(order)


    const ordemItemTwo = new OrderItem(
      "2",
      product.name,
      product.price,
      product.id,
      2
    )
    const orderTwo = new Order('2',  customer.id, [ordemItemTwo])
    await orderRepository.create(orderTwo)

    const ordersCreated = await orderRepository.findAll()
    
    expect(ordersCreated).toStrictEqual([order, orderTwo])
  })

});
