import { ChatInputCommandInteraction } from "discord.js";
import { handleNotLinked } from "../../util/NotLinked";
import { DatabaseClient } from "../../db/redis";
import { LIFXAPIClient } from "../../api/APIClient";

export async function refreshCommand(CInteraction: ChatInputCommandInteraction, redis: DatabaseClient, lifx: LIFXAPIClient) {
    const targetId = CInteraction.options.getUser('owner')?.id || CInteraction.user.id;
    const owner = await redis.ownerManager.loadOwner(targetId);

    if (owner === `not_registered`) {
        handleNotLinked(CInteraction);
        console.log(`not registered`,owner)
        return;
    }

    const result = await redis.retriveLights(owner, lifx);

    console.log({result})
    if (!result)  {
        CInteraction.reply(`An error occured while refreshing your lights!`);
        return;
    } else {
        CInteraction.reply(`Lights cache successfully refreshed!`);
        return;
    }
}