import { ChatInputCommandInteraction } from "discord.js";
import { DatabaseClient } from "../../db/redis";
import { LIFXAPIClient } from "../../api/APIClient";
import { handleNotLinked } from "../../util/NotLinked.js";

export async function toogleCommand(CInteraction: ChatInputCommandInteraction, redis: DatabaseClient, lifx: LIFXAPIClient) {
    const targetId = CInteraction.options.getUser('owner')?.id || CInteraction.user.id;
    const owner = await redis.ownerManager.loadOwner(targetId);

    if (owner === `not_registered`) {
        handleNotLinked(CInteraction);
        console.log(`not registered`,owner)
        return;
    }

    const targetSelector = CInteraction.options.getString('selector') || 'all';
    const result = await lifx.toggleLight(owner, targetSelector);

    console.log({result,targetSelector})
    if (result === `error`) {
        CInteraction.reply(`An error occured while toggling your light!`);
        return;
    } else {
        CInteraction.reply(`Light successfully toggled!`);
        return;
    }
}