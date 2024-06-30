import { ChatInputCommandInteraction } from "discord.js";
import { LIFXAPIClient } from "../../../api/APIClient";
import { DatabaseClient } from "../../../db/redis";
import { handleNotLinked } from "../../../util/NotLinked.js";

export async function effectOffCommand(CInteraction: ChatInputCommandInteraction, redis: DatabaseClient, lifx: LIFXAPIClient){
    const targetId = CInteraction.options.getUser('owner')?.id || CInteraction.user.id;
    const owner = await redis.ownerManager.loadOwner(targetId);

    if (owner === `not_registered`) {
        handleNotLinked(CInteraction);
        console.log(`not registered`,owner)
        return;
    }

    const result = await lifx.offEffects(owner);

    if(result === 'error') {
        CInteraction.reply(`An error occured while fetching your lights!`);
        return;
    } 
        CInteraction.reply(`Effects successfully turned off!`);
        
    
}