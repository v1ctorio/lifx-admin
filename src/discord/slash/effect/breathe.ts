import { ChatInputCommandInteraction } from "discord.js";
import { LIFXAPIClient } from "../../../api/APIClient";
import { DatabaseClient } from "../../../db/redis";
import { handleNotLinked } from "../../../util/NotLinked.js";
export async function BreatheEfffectCommand(CInteraction: ChatInputCommandInteraction, redis: DatabaseClient, lifx: LIFXAPIClient){
    const targetId = CInteraction.options.getUser('owner')?.id || CInteraction.user.id;
    const owner = await redis.ownerManager.loadOwner(targetId);
    if (owner === `not_registered`) {
        handleNotLinked(CInteraction);
        console.log(`not registered`,owner)
        return;
    }
     
    const color = CInteraction.options.getString('color') ;
    if (!color) {
        CInteraction.reply(`This effect needs a color!`);
        return;
    }

    let period = undefined;
    let peak = undefined;

    const from_color = CInteraction.options.getString('from_color') || undefined;
    const p = CInteraction.options.getInteger('period') || undefined;
    const cycles = CInteraction.options.getInteger('cycles') || undefined;
    const persist = CInteraction.options.getBoolean('persist') || false;
    const pea = CInteraction.options.getInteger('peak') || false;

    if(p) period = p /100;
    if(pea) peak = pea/100;


    const result = await lifx.breatheEffect(owner, 'all', {color, from_color,period,cycles,persist,peak,power_on: true});

    if(result === 'error') {
        CInteraction.reply(`An error occured while activating the effect!`);
        return;
    } 
        CInteraction.reply(`Effect breathe successfully applied!`);
        
    
}