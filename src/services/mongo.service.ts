import { MongoClient, Db, Collection } from 'mongodb';
import { DatabaseSettings } from '../configs/settings';
import { injectable, inject } from 'inversify';
import { Logger } from 'winston';

@injectable()
export class MongoService {
    
    private readonly mongoClient: MongoClient; 
    private db: Db;


    constructor
    (
        @inject("DatabaseSettings") private readonly databaseSettings: DatabaseSettings,
        @inject("Logger") private readonly logger: Logger    
    ) 
    {
        this.mongoClient = new MongoClient(databaseSettings.connectString, { useUnifiedTopology: true }); 
    }

    public async connect(): Promise<void> {
        await this.mongoClient.connect();
        this.logger.log('info', "[%s] : Connected to database -> [%s]", 'MongoService', this.databaseSettings.connectString);
        this.db = this.mongoClient.db(this.databaseSettings.databaseName);
        this.logger.log('info', `[%s] : Selected Database -> [%s]`, 'MongoService', this.databaseSettings.databaseName);
    }

    public getCollection<T>(name: string): Collection<T> {
        return this.db.collection<T>(name);
    }
}