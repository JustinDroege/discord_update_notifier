import { SubscriberService } from "./subscriberService.interface";
import { TelegramSubscriber } from "../models/telegramSubscriber.model";
import { MongoService } from "./mongo.service";
import { Collection } from "mongodb";
import { injectable, inject } from "inversify";

@injectable()
export class TelegramSubscriberService implements SubscriberService<TelegramSubscriber, string> {
    
    private readonly telegramSubscriberCollection: Collection<TelegramSubscriber>;

    constructor(@inject(MongoService) mongoService: MongoService) {
        this.telegramSubscriberCollection = mongoService.getCollection<TelegramSubscriber>('telegram')
    }
    
    async addSubscriber(subscriber: TelegramSubscriber): Promise<void> {
        if(await this.telegramSubscriberCollection.findOne({serviceId: subscriber.serviceId}))
            return;
        
        await this.telegramSubscriberCollection.insertOne(subscriber);
    }
    
    async removeSubscriber(subscriber: TelegramSubscriber): Promise<void> {
        if(! await this.telegramSubscriberCollection.findOne({serviceId: subscriber.serviceId}))
            return;
        
        await this.telegramSubscriberCollection.remove(subscriber);
    }
    
    async getSubscriber(serviceId: string): Promise<TelegramSubscriber> {
        return await this.telegramSubscriberCollection.findOne({serviceId: serviceId}) as TelegramSubscriber;
    }
    
    async getAllSubscribers(): Promise<TelegramSubscriber[]> {
        return await this.telegramSubscriberCollection.find().toArray();
    }

}