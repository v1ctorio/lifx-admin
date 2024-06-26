import { ChatInputCommandInteraction } from "discord.js";
import { DatabaseClient } from "../../db/redis";
import { LIFXAPIClient } from "../../api/APIClient";
import { handleNotLinked } from "../../util/NotLinked.js";

export async function dimCommand(CInteraction: ChatInputCommandInteraction, redis: DatabaseClient, lifx: LIFXAPIClient) {
    const targetId = CInteraction.options.getUser('owner')?.id || CInteraction.user.id;
    const owner = await redis.ownerManager.loadOwner(targetId);
    const b = CInteraction.options.getInteger('brightness') || 50;

    const brightness = b / 100;

    if(brightness < 0 || brightness > 1) {
        CInteraction.reply(`Brightness must be between 0 and 100`);
        return;
    }

    if (owner === `not_registered`) {
        handleNotLinked(CInteraction);
        console.log(`not registered`,owner)
        return;
    }

    const targetSelector = CInteraction.options.getString('selector') || 'all';
    const result = await lifx.dimLight(owner, targetSelector, brightness);

    console.log({result,targetSelector})
    if (result === `error`) {
        CInteraction.reply(`An error occured while dimming your light(s)!`);
        return;
    } else {
        CInteraction.reply(`Light(s) successfully dimmed to ${b}%!`);
        return;
    }
}