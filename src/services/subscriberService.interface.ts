export interface SubscriberService<T, S> {
    addSubscriber(subscriber: T): Promise<void>;
    removeSubscriber(subscriber: T): Promise<void>;
    getSubscriber(serviceId: S): Promise<T>;
    getAllSubscribers(): Promise<T[]>;
} 