import { ChatInputCommandInteraction } from "discord.js";
import { DatabaseClient } from "../../../db/redis.js";
import { handleNotLinked } from "../../../util/NotLinked.js";
import { LIFXAPIClient as LifxAPIClient } from "../../../api/APIClient.js";
export async function listScenesCommand(CInteraction: ChatInputCommandInteraction, redis: DatabaseClient, lifx: LifxAPIClient) {
    const targetId = CInteraction.options.getUser('owner')?.id || CInteraction.user.id;
    const owner = await redis.ownerManager.loadOwner(targetId);

    if (owner === `not_registered`) {
        handleNotLinked(CInteraction);
        return;
    }

    const scene = await lifx.listScenes(owner);
    if (!scene || scene === `error`) {
        CInteraction.reply(`An error occured while fetching your scenes! Probably your token is invalid!`);
        return;
    }
    if (scene.length === 0) {
        CInteraction.reply(`No scenes found on your account!`);
        return;
    }

    let sceneList = ``
    scene.forEach((scene) => {
        sceneList += `${scene.name} - ${scene.uuid}\n`
    })
    if (sceneList.length > 2000) { 
        CInteraction.reply(`Your scenes:\n${sceneList.slice(0, 2000)}`);
        return;
    }
    CInteraction.reply(`Your scenes:\n${sceneList}`);

    
    

}