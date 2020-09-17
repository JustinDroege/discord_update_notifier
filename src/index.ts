import 'reflect-metadata';
import path from 'path'
import { Container } from 'inversify';
import { MessageBroker, MessageBrokerService } from './services/messageBroker.service';
import { MongoService } from './services/mongo.service';
import { Settings, DiscordSettings, TwitterSettings, DatabaseSettings } from './configs/settings';
import fs from 'fs-extra';
import { DiscordSubscriberService } from './services/discordSubscriber.service';
import { TelegramSubscriberService } from './services/telegramSubscriber.service';
import { DiscordService } from './services/discord.service';
import { TwitterService } from './services/twitter.service';
import winston, { Logger, createLogger, format } from 'winston';

function setupLogger(): Logger {
    const logger = createLogger({
        level: 'debug',
        format: format.combine(
            format.splat(),
            format.timestamp(),
            format.json()
        ),
        transports: [
            new winston.transports.Console({level: 'debug'})
        ]
    })

    return logger;
}

function setupContainer(settings: Settings, logger: Logger): Container {
    
    const container = new Container();
    
    container.bind<Logger>("Logger").toConstantValue(logger);
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
    const settings = await readConfig(path.resolve(__dirname, '..', 'settings.json'));
    const logger = setupLogger();
    const container = setupContainer(settings, logger);
    
    const mongoService = container.get<MongoService>(MongoService);
    await mongoService.connect();

    const messageBroker = container.get<MessageBroker>("MessageBroker");
    const twitterService = container.get<TwitterService>(TwitterService);
    const discordService = container.get<DiscordService>(DiscordService);

    messageBroker.addMessageService(twitterService);
    messageBroker.addMessageService(discordService);

    await discordService.setup();

})();