import { ChatInputCommandInteraction } from "discord.js";
import { DatabaseClient } from "../../../db/redis.js";
import { handleNotLinked } from "../../../util/NotLinked.js";
import { LIFXAPIClient as LifxAPIClient } from "../../../api/APIClient.js";
export async function listLightsCommand(CInteraction: ChatInputCommandInteraction, redis: DatabaseClient, lifx: LifxAPIClient) {
    const targetId = CInteraction.options.getUser('owner')?.id || CInteraction.user.id;
    const owner = await redis.ownerManager.loadOwner(targetId);

    if (owner === `not_registered`) {
        handleNotLinked(CInteraction);
        return;
    }

    const lights = await redis.retriveLights(owner, lifx);
    if (!lights) {
        CInteraction.reply(`An error occured while fetching your lights! Probably your token is invalid!`);
        return;
    }
    if (lights.length === 0) {
        CInteraction.reply(`No lights found on your account!`);
        return;
    }

    let lightList = ``
    lights.forEach((light) => {
        lightList += `${light.label} - ${light.id}\n`
    })
    if (lightList.length > 2000) { 
        CInteraction.reply(`Your lights:\n${lightList.slice(0, 2000)}`);
        return;
    }
    CInteraction.reply(`Your lights:\n${lightList}`);

    
    

}