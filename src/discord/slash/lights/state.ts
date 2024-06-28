import { ChatInputCommandInteraction } from "discord.js";
import { LIFXAPIClient } from "../../../api/APIClient";
import { DatabaseClient } from "../../../db/redis";
import { handleNotLinked } from "../../../util/NotLinked.js";

export async function lightStateCommand(CInteraction: ChatInputCommandInteraction, redis: DatabaseClient, lifx: LIFXAPIClient) {
    const targetId = CInteraction.options.getUser('owner')?.id || CInteraction.user.id;
    const owner = await redis.ownerManager.loadOwner(targetId);
    let brightness: number|undefined = undefined;
    let infrared: number|undefined = undefined;

    if (owner === `not_registered`) {
        handleNotLinked(CInteraction);
        return;
    }

    

    const targetLight = CInteraction.options.getString('selector') 
    if (!targetLight) return;
    const power = CInteraction.options.getString('power');
    if (power !== `on` && power !== `off`) {
        CInteraction.reply(`Power must be either 'on' or 'off'`);
        return;
    } 
    const color = CInteraction.options.getString('color') || undefined;
    const b = CInteraction.options.getInteger('brightness') ;
    if (b) brightness = b / 100;
    const i = CInteraction.options.getInteger('infrared');
    if (i) infrared = i / 100;
    const duration = CInteraction.options.getInteger('duration') || undefined;
    if (duration && (duration < 0 || duration > 3155760000)) {
        CInteraction.reply(`Duration must be between 0 and 3155760000`);
        return;
    }

    if (!power && !color && !brightness && !infrared && !duration) {
        CInteraction.reply(`You must provide at least one of the following: power, color, brightness, infrared, duration`);
        return;
    }


    const result = await lifx.setLightState(owner, targetLight, {
        power,
        color,
        brightness,
        infrared,
        duration
    
    });

    console.log({result,targetSelector: targetLight})
    if (result === `error`) {
        CInteraction.reply(`An error occured while toggling your light!`);
        return;
    } else {
        CInteraction.reply(`Light successfully toggled!`);
        return;
    }
}