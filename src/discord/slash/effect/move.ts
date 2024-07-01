import { ChatInputCommandInteraction } from "discord.js";
import { LIFXAPIClient } from "../../../api/APIClient";
import { DatabaseClient } from "../../../db/redis";
import { handleNotLinked } from "../../../util/NotLinked.js";
import { Direction } from "../../../types/lifx";
export async function moveEffectCommand(CInteraction: ChatInputCommandInteraction, redis: DatabaseClient, lifx: LIFXAPIClient){
    const targetId = CInteraction.options.getUser('owner')?.id || CInteraction.user.id;
    const owner = await redis.ownerManager.loadOwner(targetId);
    if (owner === `not_registered`) {
        handleNotLinked(CInteraction);
        console.log(`not registered`,owner)
        return;
        }
    const selector = CInteraction.options.getString('selector') || 'all';

    let direction = (CInteraction.options.getString('direction') as Direction) || 'forward';
    
    const period = CInteraction.options.getInteger('period') || undefined;
    const cycles = CInteraction.options.getInteger('cycles') || undefined;
     
    const result = await lifx.moveEffect(owner, selector, {direction,period,cycles, power_on: true});

    if(result === 'error') {
        CInteraction.reply(`An error occured while applying the effect!`);
        return;
    } 
        CInteraction.reply(`Effect move successfully applied off!`);

    
}