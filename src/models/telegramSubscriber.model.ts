import { Subscriber } from "./subscriber.interface";
import { ObjectId } from "mongodb";

export class TelegramSubscriber implements Subscriber<string> {
    public serviceId: string;
    public id: ObjectId;

    constructor() {
        this.id = new ObjectId();
    }
}