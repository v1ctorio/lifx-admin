import { ChatInputCommandInteraction } from "discord.js";
import { DatabaseClient } from "../../db/redis";
import { LIFXAPIClient } from "../../api/APIClient";
import { handleNotLinked } from "../../util/NotLinked.js";
import { basicColors } from "../../types/lifx";

export async function colorCommand(CInteraction: ChatInputCommandInteraction, redis: DatabaseClient, lifx: LIFXAPIClient) {
    const targetId = CInteraction.options.getUser('owner')?.id || CInteraction.user.id;
    const owner = await redis.ownerManager.loadOwner(targetId);
    const color = CInteraction.options.getString('color');
    const basicColors = ['white','red','orange','yellow','cyan','green','blue','purple','pink'];

    if(!color) return;
    if(!basicColors.includes(color)) {

    }
    

    if (owner === `not_registered`) {
        handleNotLinked(CInteraction);
        console.log(`not registered`,owner)
        return;
    }

    const targetSelector = CInteraction.options.getString('selector') || 'all';
    const result = await lifx.colorLight(owner, targetSelector, color);

    console.log({result,targetSelector})
    if (result === `error`) {
        CInteraction.reply(`An error occured while changing the color of your light(s)!`);
        return;
    } else {
        CInteraction.reply(`Light(s) color successfully changed to ${color}%!`);
        return;
    }
}