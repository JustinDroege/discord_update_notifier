import { MessageService } from "./messageService.interface";
import { DiscordSettings } from "../configs/settings";
import { DiscordSubscriberService } from "./discordSubscriber.service";
import {Client, GuildMember, Guild, User} from 'discord.js'
import { MessageBroker } from "./messageBroker.service";
import { inject, injectable } from "inversify";

@injectable()
export class DiscordService implements MessageService {
    
    private readonly discordClient: Client;
    private readonly instance = this;

    constructor(
        @inject("DiscordSettings") private readonly discordSettings: DiscordSettings, 
        @inject(DiscordSubscriberService) private readonly discordSubscriberService: DiscordSubscriberService, 
        @inject("MessageBroker") private readonly messageBroker: MessageBroker) 
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
        await this.setupEvents();
    }

    public async send(message: string): Promise<void> {
        for(const discordSubscriber of await this.discordSubscriberService.getAllSubscribers()) {
            await this.sendMessageToDiscordUser(discordSubscriber.serviceId, message);
        }
    }
    
    private async sendMessageToDiscordUser(discordUserId: string, message: string): Promise<void> {
        const user = this.discordClient.users.get(discordUserId);

        if(!user)
            return;
        
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

        await this.messageBroker.send(`Folgender Benutzer ist dem Server beigetreten: ${guildMember.user.username}`);
    }

    private async guildBanAddEvent(guild: Guild, user: User): Promise<void> {
        if(!this.isGuildWhitelisted(guild.id))
            return;

        await this.messageBroker.send(`Folgender Benutzer wurde gebannt: ${user.username}`);
    }

    private async voiceStateUpdateEvent(oldState: GuildMember, newState: GuildMember): Promise<void> {
        if(!(this.isGuildWhitelisted(newState.guild.id) && this.isUserWhitelisted(newState.user.id)))
            return;

        const userName = newState.user.username;

        if(!newState.voiceChannel) {
            await this.messageBroker.send(`${userName} ist disconnected`);
            return;
        }

        const channelName = newState.voiceChannel.name ? newState.voiceChannel.name : '';
        const category = newState.voiceChannel.parent ? newState.voiceChannel.parent.name : '';
        const muted = newState.mute ? 'Aus' : 'An';
        const deaf = newState.deaf ? 'Aus' : 'An';


        oldState !== newState
            ?   await this.messageBroker.send(`Folgender Benutzer hat im Channel: [${category}:${channelName}] ein Update: [${userName}] -> Mikrofon ${muted}, Ton ${deaf}`)
            :   await this.messageBroker.send(`Folgender Benutzer [${userName}] ist im folgenden Channel gejoined: [${category}:${channelName}] -> Mikrofon ${muted}, Ton ${deaf}`);
        
    }
}