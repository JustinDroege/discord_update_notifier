import { MessageService } from "./messageService.interface";
import { TwitterSettings } from "../configs/settings";

import Twitter from 'twitter';
import { inject, injectable } from "inversify";
import { Logger } from "winston";

@injectable()
export class TwitterService implements MessageService {
    
    private readonly twitterClient: Twitter; 

    constructor
    (
        @inject("TwitterSettings") private readonly twitterSettings: TwitterSettings,
        @inject("Logger") private readonly logger: Logger
    ) 
    {
        this.twitterClient = new Twitter({
            // eslint-disable-next-line @typescript-eslint/camelcase
            consumer_key: twitterSettings.consumerKey,
            // eslint-disable-next-line @typescript-eslint/camelcase
            consumer_secret: twitterSettings.consumerSecret,
            // eslint-disable-next-line @typescript-eslint/camelcase
            access_token_key: twitterSettings.authTokenKey,
            // eslint-disable-next-line @typescript-eslint/camelcase
            access_token_secret: twitterSettings.authTokenSecret
          });

          this.logger.log('info', '[%s] : Twitter client initialized and logged in', 'Twitter');
    }

    async send(message: string): Promise<void> {
        this.logger.log('info', '[%s] : Create new post', 'Twitter');
        await new Promise((resolve, reject) => {
            this.twitterClient.post('statuses/update', {status: message}, (error: Error) => {
                if(error) {
                    this.logger.log('error', '[%s] : [%s]', 'Twitter', error.message)
                    reject(error);
                }
                resolve();
            });
        });
    }

}