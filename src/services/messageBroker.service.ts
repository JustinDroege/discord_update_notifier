import { MessageService } from "./messageService.interface";
import { injectable } from "inversify";


export interface MessageBroker {
    addMessageService(messageService: MessageService): Promise<void>;
    removeMessageService(messageService: MessageService): Promise<void>;
    send(message: string): Promise<void>;
}

@injectable()
export class MessageBrokerService implements MessageBroker {   
    private messageProviders: MessageService[] = [];

    public async addMessageService(messageService: MessageService): Promise<void> {
        if(!this.messageProviders.indexOf(messageService))
            return;
        
        this.messageProviders.push(messageService);
    }
    
    public async removeMessageService(messageService: MessageService): Promise<void> {
        this.messageProviders = this.messageProviders.filter(e => e !== messageService);
    }
    
    public async send(message: string): Promise<void> {
        for(const messageProvider of this.messageProviders) {
            await messageProvider.send(message);
        }
    }
}