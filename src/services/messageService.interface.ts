export interface MessageService {
    send(message: string): Promise<void>;
}