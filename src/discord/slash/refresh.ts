import { ChatInputCommandInteraction } from "discord.js";
import { handleNotLinked } from "../../util/NotLinked.js";
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

    const lights = await redis.retriveLights(owner, lifx,true);
    const scenes = await redis.retriveScenes(owner, lifx,true);

    console.log({lights,scenes})
    if (!lights || !scenes)  {
        CInteraction.reply(`An error occured while refreshing your lights or scenes!`);
        return;
    } else {
        CInteraction.reply(`Cache successfully refreshed!`);
        return;
    }
}