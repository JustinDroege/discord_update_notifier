import { Subscriber } from "./subscriber.interface";
import { ObjectId } from "mongodb";

export class DiscordSubscriber implements Subscriber<string> {
    public id: ObjectId;
    public serviceId: string;

    constructor() {
        this.id = new ObjectId();
    }
} 