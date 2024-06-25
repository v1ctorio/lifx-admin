import { RedisClientType } from "redis";
import { lightOwner } from "../types/internal";
import { OwnerManager } from "./manageOwner.js";

export class DatabaseClient {
    private client: RedisClientType;
    public ownerManager: OwnerManager;
    constructor(client: RedisClientType) {
        this.client = client;
        this.ownerManager = new OwnerManager(client);
    }
    public async retriveToken(owner:lightOwner) {
        return await this.ownerManager.loadOwner(owner.id)
    }
}