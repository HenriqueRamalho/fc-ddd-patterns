import { Sequelize } from "sequelize-typescript";
import CustomerModel from "../../../infrastructure/customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../infrastructure/customer/repository/sequelize/customer.repository";
import Customer from "../../customer/entity/customer";
import CustomerChangedAddressEvent from "../../customer/event/customer-changed-address.event";
import CustomerCreatedEvent from "../../customer/event/customer-created.event";
import SendConsoleLog1Handler from "../../customer/event/handler/send-console-log-1.handler";
import SendConsoleLog2Handler from "../../customer/event/handler/send-console-log-2.handler";
import SendConsoleLogWithNewCustomerAddress from "../../customer/event/handler/send-console-log-with-new-customer-address";
import Address from "../../customer/value-object/address";
import SendEmailWhenProductIsCreatedHandler from "../../product/event/handler/send-email-when-product-is-created.handler";
import ProductCreatedEvent from "../../product/event/product-created.event";
import EventDispatcher from "./event-dispatcher";

describe("Domain events tests", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([CustomerModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should register an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      1
    );
    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);
  });

  it("should unregister an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregister("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      0
    );
  });

  it("should unregister all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregisterAll();

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeUndefined();
  });

  it("should notify all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();
    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    const productCreatedEvent = new ProductCreatedEvent({
      name: "Product 1",
      description: "Product 1 description",
      price: 10.0,
    });

    // Quando o notify for executado o SendEmailWhenProductIsCreatedHandler.handle() deve ser chamado
    eventDispatcher.notify(productCreatedEvent);

    expect(spyEventHandler).toHaveBeenCalled();
  });

  it("Should invocate two events when a new customer is created", async () => {

    const customer = new Customer("1", "John Lennon")
    const address = new Address("Street 1", 123, "13330-250", "São Paulo")
    customer.Address = address
    const customerRepository = new CustomerRepository()
   
    const eventDispatcher = new EventDispatcher()
    const eventHandlerOne = new SendConsoleLog1Handler()
    const eventHandlerTwo = new SendConsoleLog2Handler()
    const spyEventHandler = jest.spyOn(eventHandlerOne, "handle")

    eventDispatcher.register("CustomerCreatedEvent", eventHandlerOne)
    eventDispatcher.register("CustomerCreatedEvent", eventHandlerTwo)

    await customerRepository.create(customer)
    const customerCreated = await customerRepository.find(customer.id)
    const customerCreatedEvent = new CustomerCreatedEvent({
      id: customerCreated.id,
      name: customerCreated.name
    })
    eventDispatcher.notify(customerCreatedEvent)

    expect(spyEventHandler).toHaveBeenCalled()
    
  })

  it("Should invocate an handler when a customer change its address", async () => {

    const customer = new Customer("2", "Michael Scott")
    const address = new Address("Slough Avenue,", 1725, "12345-123", "Pennsylvania")
    customer.Address = address
    const customerRepository = new CustomerRepository()

    const eventDispatcher = new EventDispatcher()
    const eventHandler = new SendConsoleLogWithNewCustomerAddress()
    const spyEventHandler = jest.spyOn(eventHandler, "handle")

    eventDispatcher.register('CustomerChangedAddressEvent', eventHandler)

    await customerRepository.create(customer)
    const customerCreated = await customerRepository.find(customer.id)

    const newCustomerAddress = new Address('St Marys Rd', 4813, '12345-999', "Winnipeg")
    customerCreated.changeAddress(newCustomerAddress)  
    const customerChangedAddressEvent = new CustomerChangedAddressEvent({
      id: customerCreated.id,
      name: customer.name,
      address: customer.Address
    })
    eventDispatcher.notify(customerChangedAddressEvent)

    expect(spyEventHandler).toHaveBeenCalled()

  })
});
