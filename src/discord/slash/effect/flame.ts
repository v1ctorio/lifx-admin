import { ChatInputCommandInteraction } from "discord.js";
import { LIFXAPIClient } from "../../../api/APIClient";
import { DatabaseClient } from "../../../db/redis";
import { handleNotLinked } from "../../../util/NotLinked.js";
export async function FlameEffectCommand(CInteraction: ChatInputCommandInteraction, redis: DatabaseClient, lifx: LIFXAPIClient){
    const targetId = CInteraction.options.getUser('owner')?.id || CInteraction.user.id;
    const owner = await redis.ownerManager.loadOwner(targetId);
    const selector = CInteraction.options.getString('selector') || 'all';
    if (owner === `not_registered`) {
        handleNotLinked(CInteraction);
        console.log(`not registered`,owner)
        return;
        }

    const period = CInteraction.options.getInteger('period') || undefined;
    const duration = CInteraction.options.getInteger('duration') || undefined;

    const result = await lifx.flameEffect(owner, selector, {period, duration, power_on: true});

    if(result === 'error') {
        CInteraction.reply(`An error occured while applying the effect!`);
        return;
    } 
        CInteraction.reply(`Effect flame successfully applied!`);
        
}