import EventInterface from "../../@shared/event/event.interface";
import Address from "../value-object/address";

export default class CustomerChangedAddressEvent implements EventInterface {
    dataTimeOccurred: Date;
    eventData: {
        id: string,
        name: string,
        address: Address
    };
    
    constructor(eventData: any) {
        this.dataTimeOccurred = new Date()
        this.eventData = eventData
    }
}