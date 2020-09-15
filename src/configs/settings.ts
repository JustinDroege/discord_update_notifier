export interface DatabaseSettings {
    connectString: string;
    databaseName: string;
}

export interface DiscordSettings {
    userToken: string;
    usersToFollow: string[];
    guildsToFollow: string[];
}

export interface TwitterSettings {
    consumerKey: string;
    consumerSecret: string;
    authTokenKey: string;
    authTokenSecret: string;
}

export interface TelegramSettings {
    botToken: string;
}

export interface Settings {
    databaseSettings: DatabaseSettings;
    discordSettings: DiscordSettings;
    twitterSettings: TwitterSettings;
    telegramSettings: TelegramSettings;
}