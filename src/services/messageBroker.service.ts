import { MessageService } from "./messageService.interface";
import { injectable, inject } from "inversify";
import { Logger } from "winston";


export interface MessageBroker {
    addMessageService(messageService: MessageService): Promise<void>;
    removeMessageService(messageService: MessageService): Promise<void>;
    send(message: string): Promise<void>;
}

@injectable()
export class MessageBrokerService implements MessageBroker {   
    private messageProviders: MessageService[] = [];

    constructor(@inject('Logger') private readonly logger: Logger) {}

    public async addMessageService(messageService: MessageService): Promise<void> {
        if(!this.messageProviders.indexOf(messageService))
            return;
        this.logger.log('debug', '[%s] : Added message service', 'MessageBroker');
        this.messageProviders.push(messageService);
    }
    
    public async removeMessageService(messageService: MessageService): Promise<void> {
        this.logger.log('debug', '[%s] : Removed message service', 'MessageBroker');
        this.messageProviders = this.messageProviders.filter(e => e !== messageService);
    }
    
    public async send(message: string): Promise<void> {
        this.logger.log('debug', '[%s] : Send message -> [%s]', 'MessageBroker', message);
        for(const messageProvider of this.messageProviders) {
            try{
                await messageProvider.send(message);
            }
            catch(error) {
                this.logger.error('error', '[%s] : An message service couldnt deliver the message -> [%s]', 'MessageBroker', message);
            }
        }
    }
}