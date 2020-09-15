import 'reflect-metadata';
import { Container } from 'inversify';
import { MessageBroker, MessageBrokerService } from './services/messageBroker.service';
import { MongoService } from './services/mongo.service';
import { Settings, DiscordSettings, TwitterSettings, TelegramSettings, DatabaseSettings } from './configs/settings';
import fs from 'fs-extra';
import { DiscordSubscriberService } from './services/discordSubscriber.service';
import { TelegramSubscriberService } from './services/telegramSubscriber.service';
import { DiscordService } from './services/discord.service';
import { TelegramService } from './services/telegram.service';
import { TwitterService } from './services/twitter.service';


function setupContainer(settings: Settings): Container {
    
    const container = new Container();
    
    container.bind<DiscordSettings>("DiscordSettings").toConstantValue(settings.discordSettings);
    container.bind<TwitterSettings>("TwitterSettings").toConstantValue(settings.twitterSettings);
    //container.bind<TelegramSettings>("TelegramSettings").toConstantValue(settings.telegramSettings);
    container.bind<DatabaseSettings>("DatabaseSettings").toConstantValue(settings.databaseSettings);

    container.bind<MessageBroker>("MessageBroker").to(MessageBrokerService).inSingletonScope();
    container.bind<MongoService>(MongoService).to(MongoService).inSingletonScope();
    container.bind<DiscordSubscriberService>(DiscordSubscriberService).to(DiscordSubscriberService).inSingletonScope();
    container.bind<TelegramSubscriberService>(TelegramSubscriberService).to(TelegramSubscriberService).inSingletonScope();
    container.bind<DiscordService>(DiscordService).to(DiscordService).inSingletonScope();
    //container.bind<TelegramService>(TelegramService).to(TelegramService);
    container.bind<TwitterService>(TwitterService).to(TwitterService).inSingletonScope();


    return container;
}

async function readConfig(path: string): Promise<Settings> {
    return await fs.readJSON(path);
}

(async () => {
    const settings = await readConfig('/home/justin/documents/discord_update_notifier_typescript/settings.json');
    const container = setupContainer(settings);
    
    const mongoService = container.get<MongoService>(MongoService);
    await mongoService.connect();

    const messageBroker = container.get<MessageBroker>("MessageBroker");
    const twitterService = container.get<TwitterService>(TwitterService);
    const discordService = container.get<DiscordService>(DiscordService);

    messageBroker.addMessageService(twitterService);
    messageBroker.addMessageService(discordService);

    await discordService.setup();

})();