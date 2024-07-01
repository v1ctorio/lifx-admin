import { ChatInputCommandInteraction } from "discord.js";
import { LIFXAPIClient } from "../../../api/APIClient";
import { DatabaseClient } from "../../../db/redis";
import { handleNotLinked } from "../../../util/NotLinked.js";
export async function MorphEffectCommand(CInteraction: ChatInputCommandInteraction, redis: DatabaseClient, lifx: LIFXAPIClient){
    const targetId = CInteraction.options.getUser('owner')?.id || CInteraction.user.id;
    const owner = await redis.ownerManager.loadOwner(targetId);
    if (owner === `not_registered`) {
        handleNotLinked(CInteraction);
        console.log(`not registered`,owner)
        return;
        }
    const selector = CInteraction.options.getString('selector') || 'all';
    const duration = CInteraction.options.getInteger('duration') || undefined;
    const period = CInteraction.options.getInteger('period') || undefined;
    
    const palette1 = CInteraction.options.getString('palette1') || undefined;
    const palette2 = CInteraction.options.getString('palette2') || undefined;
    const palette3 = CInteraction.options.getString('palette3') || undefined;
    const palette4 = CInteraction.options.getString('palette4') || undefined;
    const palette5 = CInteraction.options.getString('palette5') || undefined;

    let colors: Array<String|undefined> | undefined = [palette1, palette2, palette3, palette4, palette5]
    if (colors && colors[0] == undefined) {
        colors = undefined;
    }
    const result = await lifx.morphEffect(owner, selector, {duration, period , palette:colors as string[], power_on: true});

    if(result === 'error') {
        CInteraction.reply(`An error occured while fetching your lights!`);
        return;
    } 
        CInteraction.reply(`Effects successfully turned off!`);
        
    
}