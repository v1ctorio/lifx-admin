import { RedisClientType } from "redis";
import { lightOwner } from "../types/internal";

type databaseTransactionResponse = `ok` | `error`;

export class OwnerManager {
    private client: RedisClientType;
    constructor(client: RedisClientType) {
        this.client = client;
    }
    public async loadOwner(id: string, ): Promise<lightOwner | `not_registered`>  {

        //TODO: Implement a cache system and check it
        const token = await this.client.get(`${id}.token`)
        if (!token) return `not_registered`
        
        return {
            id,
            token
        }
    }
    public async registerOwner(id:string, token:string, ) {
        //await redis.set(`${id}.token`, token)

        this.client.set(`${id}.token`, token)
        .catch((err) => {
            console.error(err)
            return `error`
        })
        .then((res) => {
            console.log(res)
            return `ok`
        })

    }
}

