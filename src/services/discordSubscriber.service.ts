import { SubscriberService } from "./subscriberService.interface";
import { DiscordSubscriber } from "../models/discordSubscriber.model";
import { MongoService } from "./mongo.service";
import { Collection } from "mongodb";
import { injectable, inject } from "inversify";

@injectable()
export class DiscordSubscriberService implements SubscriberService<DiscordSubscriber, string> {
    
    private readonly discordSubscriberCollection: Collection<DiscordSubscriber>;

    constructor(@inject(MongoService) mongoService: MongoService) {
        this.discordSubscriberCollection = mongoService.getCollection<DiscordSubscriber>('discordSubscriber');
    }

    async addSubscriber(subscriber: DiscordSubscriber): Promise<void> {
        if(await this.discordSubscriberCollection.findOne({serviceId: subscriber.serviceId}))
            return;

        this.discordSubscriberCollection.insertOne(subscriber);
    }
    
    async removeSubscriber(subscriber: DiscordSubscriber): Promise<void> {
        if(! await this.discordSubscriberCollection.findOne({serviceId: subscriber.serviceId}))
            return;
        
        this.discordSubscriberCollection.remove(subscriber);
    }
    
    async getSubscriber(serviceId: string): Promise<DiscordSubscriber> {
        return await this.discordSubscriberCollection.findOne({serviceId: serviceId}) as DiscordSubscriber;
    }
    
    async getAllSubscribers(): Promise<DiscordSubscriber[]> {
        return await this.discordSubscriberCollection.find().toArray();
    }

}