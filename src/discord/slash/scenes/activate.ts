import { ChatInputCommandInteraction } from "discord.js";
import { DatabaseClient } from "../../../db/redis";
import { LIFXAPIClient } from "../../../api/APIClient";
import { handleNotLinked } from "../../../util/NotLinked.js";

export async function activateSceneCommand(CInteraction: ChatInputCommandInteraction, redis: DatabaseClient, lifx: LIFXAPIClient) {
    const targetId = CInteraction.options.getUser('owner')?.id || CInteraction.user.id;
    const owner = await redis.ownerManager.loadOwner(targetId);

    if (owner === `not_registered`) {
        handleNotLinked(CInteraction);
        console.log(`not registered`,owner)
        return;
    }

    const targetScene = CInteraction.options.getString('scene') 
    if (!targetScene) return;

    const result = await lifx.activateScene(owner, targetScene);

    console.log({result,targetSelector: targetScene})
    if (result === `error`) {
        CInteraction.reply(`An error occured while activating your scene!`);
        return;
    } else {
        CInteraction.reply(`Scene successfully activated!`);
        return;
    }
}