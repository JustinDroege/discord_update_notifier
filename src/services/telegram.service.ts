import { MessageService } from "./messageService.interface";
import { Telegraf } from 'telegraf';
import { TelegrafContext } from "telegraf/typings/context";
import { TelegramSettings } from "../configs/settings";
import { TelegramSubscriberService } from "./telegramSubscriber.service";
import { MessageBroker } from "./messageBroker.service";
import { inject } from "inversify";


export class TelegramService implements MessageService {
    
    private readonly telegramService: Telegraf<TelegrafContext>;

    constructor(
        @inject("TelegramSettings") telegramSettings: TelegramSettings, 
        @inject(TelegramSubscriberService) private readonly telegramSubscriberService: TelegramSubscriberService,
        @inject("MessageBroker") private readonly messageBroker: MessageBroker) 
    {
        this.telegramService = new Telegraf(telegramSettings.botToken);
    }

    async send(message: string): Promise<void> {
        for(const telegramSubscriber of await this.telegramSubscriberService.getAllSubscribers()) {
            await this.sendMessageToUser(telegramSubscriber.serviceId, message);
        }
    }

    async sendMessageToUser(telegramId: string, message: string): Promise<void> {
        await this.telegramService.telegram.sendMessage(telegramId, message);
    }

}