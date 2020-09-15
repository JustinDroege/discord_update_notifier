import { MessageService } from "./messageService.interface";
import { TwitterSettings } from "../configs/settings";

import Twitter from 'twitter';
import { inject, injectable } from "inversify";

@injectable()
export class TwitterService implements MessageService {
    
    private readonly twitterClient: Twitter; 

    constructor(@inject("TwitterSettings") private readonly twitterSettings: TwitterSettings) {
        this.twitterClient = new Twitter({
            // eslint-disable-next-line @typescript-eslint/camelcase
            consumer_key: twitterSettings.consumerKey,
            // eslint-disable-next-line @typescript-eslint/camelcase
            consumer_secret: twitterSettings.consumerSecret,
            // eslint-disable-next-line @typescript-eslint/camelcase
            access_token_key: twitterSettings.authTokenKey,
            // eslint-disable-next-line @typescript-eslint/camelcase
            access_token_secret: twitterSettings.authTokenSecret
          }) 
    }

    async send(message: string): Promise<void> {
        await new Promise((resolve, reject) => {
            this.twitterClient.post('statuses/update', {status: message}, (error: unknown) => {
                if(error)
                    reject(error);
                resolve();
            });
        });
    }

}