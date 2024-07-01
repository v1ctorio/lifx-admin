import { RedisClientType } from "redis";
import { lightOwner } from "../types/internal";
import { OwnerManager } from "./manageOwner.js";
import { LIFXAPIClient } from "../api/APIClient";
import { light, scene } from "../types/lifx";

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
    public async retriveLights(owner:lightOwner, LIFX: LIFXAPIClient,force?: boolean): Promise<light[]|undefined> {
        console.log({owner})
        const maxCacheTime = 60 * 60 * 60; // 1 hour
        const now = Date.now();

        let lights: light[]|undefined;
        let l = await this.client.get(owner.id+`._lights`) ;

        if(!l ) {
            const li = await LIFX.listLights(owner);
            if ((li as unknown as string) == 'error') return undefined;
            lights = li as light[];

            this.client.set(owner.id+`._lights`, JSON.stringify(li));
            this.client.set(owner.id+`._lights.updated`, now);
            console.log('Retrived lights from lifx as there were anything in cache')
        } else {
            const updatedAgo = await this.client.get(owner.id+`._lights.updated`) as string;
            console.log('Retrived lights from redis as they were in cache')
            
            if (now - parseInt(updatedAgo) > maxCacheTime || force) {
                const li = await LIFX.listLights(owner);
                if ((li as unknown as string) == 'error') return undefined;
                lights = li as light[];
    
                this.client.set(owner.id+`._lights`, JSON.stringify(li));
                this.client.set(owner.id+`._lights.updated`, now); 
                console.log('Retrived lights from lifx since cached has expired')
            }
            lights = JSON.parse(l);
        }
        return lights;
    }
    public async retriveScenes(owner:lightOwner, LIFX:LIFXAPIClient, force?:boolean){
        console.log({owner})
        const maxCacheTime = 60 * 60 * 60; // 1 hour
        const now = Date.now();

        let scenes:scene[]|undefined;
        const s = await this.client.get(owner.id+`._scenes`) ;
        if(!s) {
            const sc = await LIFX.listScenes(owner);
            if ((sc as unknown as string) == 'error') return undefined;
            scenes = sc as scene[];

            this.client.set(owner.id+`._scenes`, JSON.stringify(scenes));
            this.client.set(owner.id+`._scenes.updated`, now);
            console.log('Retrived scenes from lifx as there were anything in cache')
        } else {
            const updatedAgo = await this.client.get(owner.id+`._scenes.updated`) as string;
            console.log('Retrived scenes from redis as they were in cache')
            
            if (now - parseInt(updatedAgo) > maxCacheTime || force) {
                const sc = await LIFX.listScenes(owner);
                if ((sc as unknown as string) == 'error') return undefined;
                scenes = sc as scene[];
    
                this.client.set(owner.id+`._scenes`, JSON.stringify(sc));
                this.client.set(owner.id+`._scenes.updated`, now); 
                console.log('Retrived scenes from lifx since cached has expired')
            }
            scenes = JSON.parse(s);
        }
        return scenes;
    }
}