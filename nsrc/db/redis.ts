import { RedisClientType } from "redis";
import { lightOwner } from "../types/internal";

class DataBaseClient {
    private client: RedisClientType;
    constructor(client: RedisClientType) {
        this.client = client;
    }
    public async listLights(owner:lightOwner) {
        
    }
}