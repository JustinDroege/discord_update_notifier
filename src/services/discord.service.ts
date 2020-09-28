import { MessageService } from "./messageService.interface";
import { DiscordSettings } from "../configs/settings";
import { DiscordSubscriberService } from "./discordSubscriber.service";
import {Client, GuildMember, Guild, User} from 'discord.js'
import { MessageBroker } from "./messageBroker.service";
import { inject, injectable } from "inversify";
import { Logger } from "winston";

@injectable()
export class DiscordService implements MessageService {
    
    private readonly discordClient: Client;

    constructor
    (
        @inject("DiscordSettings") private readonly discordSettings: DiscordSettings, 
        @inject(DiscordSubscriberService) private readonly discordSubscriberService: DiscordSubscriberService, 
        @inject("MessageBroker") private readonly messageBroker: MessageBroker,
        @inject("Logger") private readonly logger: Logger
    )
    {
        this.discordClient = new Client()
    }

    public async setup(): Promise<void> {
        
        const ready = new Promise((resolve) => {
            this.discordClient.on('ready', () => {
                resolve();
            })
        });

        await this.discordClient.login(this.discordSettings.userToken);
        await ready;
        
        this.logger.log('info', '[%s] : Logged in', 'Discord');
        
        await this.setupEvents();
        
        this.logger.log('debug', '[%s] : Events registered', 'Discord');
    }

    public async send(message: string): Promise<void> {
        this.logger.log('debug', '[%s] : Send messages to subscriber', 'Discord');
        for(const discordSubscriber of await this.discordSubscriberService.getAllSubscribers()) {
            await this.sendMessageToDiscordUser(discordSubscriber.serviceId, message);
        }
    }
    
    private async sendMessageToDiscordUser(discordUserId: string, message: string): Promise<void> {
        const user = this.discordClient.users.get(discordUserId);

        if(!user)
            return;
        this.logger.log('debug', '[%s] : Send message to user [%s]', 'Discord', discordUserId);
        await user.send(message);
    }

    private isUserWhitelisted(userId: string): boolean {
        return this.discordSettings.usersToFollow.findIndex(e => e === userId) >= 0;
    }

    private isGuildWhitelisted(guildId: string): boolean {
        return this.discordSettings.guildsToFollow.findIndex(e => e === guildId) >= 0;
    }

    private async setupEvents(): Promise<void> {
        this.discordClient.on('voiceStateUpdate', this.voiceStateUpdateEvent.bind(this));
        this.discordClient.on('guildBanAdd', this.guildBanAddEvent.bind(this));
        this.discordClient.on('guildMemberAdd', this.guildMemberAddEvent.bind(this));
    }

    private async guildMemberAddEvent(guildMember: GuildMember): Promise<void> {
        if(!this.isGuildWhitelisted(guildMember.guild.id))
            return;

        this.logger.log('debug', '[%s] : Following user is joined a guild [%s]', 'Discord', guildMember.user.username);
        await this.messageBroker.send(`Folgender Benutzer ist dem Server beigetreten: ${guildMember.user.username}`);
    }

    private async guildBanAddEvent(guild: Guild, user: User): Promise<void> {
        if(!this.isGuildWhitelisted(guild.id))
            return;

        this.logger.log('debug', '[%s] : Following user was banned from a guild [%s]', 'Discord', user.username);
        await this.messageBroker.send(`Folgender Benutzer wurde gebannt: ${user.username}`);
    }

    private async voiceStateUpdateEvent(oldState: GuildMember, newState: GuildMember): Promise<void> {
        if(!(this.isGuildWhitelisted(newState.guild.id) && this.isUserWhitelisted(newState.user.id)))
            return;

        const userName = newState.user.username;
        this.logger.log('debug', '[%s] : Following user has an channel update [%s]', 'Discord', newState.user.username);
        
        if(!newState.voiceChannelID) {
            await this.messageBroker.send(`${userName} ist disconnected`);
            return;
        }

        const channelName = newState.voiceChannel.name ? newState.voiceChannel.name : '';
        const category = newState.voiceChannel.parent ? newState.voiceChannel.parent.name : '';
        const muted = newState.mute ? 'Aus' : 'An';
        const deaf = newState.deaf ? 'Aus' : 'An';


        oldState.voiceChannelID === newState.voiceChannelID
            ?   await this.messageBroker.send(`Folgender Benutzer [${userName}] hat im Channel [${category}:${channelName}] ein Update -> Mikrofon ${muted}, Ton ${deaf}`)
            :   await this.messageBroker.send(`Folgender Benutzer [${userName}] ist im folgenden Channel [${category}:${channelName}] gejoined -> Mikrofon ${muted}, Ton ${deaf}`);
        
    }
}