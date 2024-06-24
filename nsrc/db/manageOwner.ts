import { RedisClientType } from "redis";
import { lightOwner } from "../types/internal";

export async function loadOwner(id: string, redis:RedisClientType ): Promise<lightOwner | `not_registered`>  {

    //TODO: Implement a cache system and check it
    const token = await redis.get(`${id}.token`)
    if (!token) return `not_registered`
    
    return {
        id,
        token
    }
}
export async function registerOwner 