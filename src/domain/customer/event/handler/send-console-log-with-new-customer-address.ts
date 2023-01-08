import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import ProductCreatedEvent from "../../../product/event/product-created.event";
import CustomerChangedAddressEvent from "../customer-changed-address.event";

export default class SendConsoleLogWithNewCustomerAddress implements EventHandlerInterface<ProductCreatedEvent> {
    handle(event: CustomerChangedAddressEvent): void {
        console.log(`Endereço do cliente: ${event.eventData.id}, ${event.eventData.name} alterado para: ${event.eventData.address.toString()}`)
    }    
}