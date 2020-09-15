import { MongoClient, Db, Collection } from 'mongodb';
import { DatabaseSettings } from '../configs/settings';
import { injectable, inject } from 'inversify';

@injectable()
export class MongoService {
    
    private readonly mongoClient: MongoClient; 
    private db: Db;


    constructor(@inject("DatabaseSettings") private readonly databaseSettings: DatabaseSettings) {
        this.mongoClient = new MongoClient(databaseSettings.connectString, { useUnifiedTopology: true }); 
    }

    public async connect(): Promise<void> {
        await this.mongoClient.connect();
        this.db = this.mongoClient.db(this.databaseSettings.databaseName);
    }

    public getCollection<T>(name: string): Collection<T> {
        return this.db.collection<T>(name);
    }
}