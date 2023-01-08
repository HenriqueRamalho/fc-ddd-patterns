import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import ProductCreatedEvent from "../../../product/event/product-created.event";

export default class SendConsoleLog1Handler implements EventHandlerInterface<ProductCreatedEvent> {
    handle(event: ProductCreatedEvent): void {
        console.log('Esse é o primeiro console.log do evento: CustomerCreated')
    }
    
}