import { ChatInputCommandInteraction } from "discord.js";
import { DatabaseClient } from "../../../db/redis";
import { LIFXAPIClient } from "../../../api/APIClient";
import { handleNotLinked } from "../../../util/NotLinked.js";

export async function PulseEffectCommand(CInteraction: ChatInputCommandInteraction, redis: DatabaseClient, lifx: LIFXAPIClient) {
    const targetId = CInteraction.options.getUser('owner')?.id || CInteraction.user.id;
    const owner = await redis.ownerManager.loadOwner(targetId);
    const basicColors = ['white','red','orange','yellow','cyan','green','blue','purple','pink'];



    if (owner === `not_registered`) {
        handleNotLinked(CInteraction);
        console.log(`not registered`, owner)
        return;
    }

    const targetSelector = CInteraction.options.getString('selector') || 'all';
    
    const c = CInteraction.options.getString('color');
    if (!c) {
        CInteraction.reply(`You must provide a color!`);
        return;
    }
    const fc = CInteraction.options.getString('from_color') || undefined;

    if (basicColors.includes(c) == false) {
        CInteraction.reply(`Invalid color provided!`);
        return;
    }
    if (fc && basicColors.includes(fc) == false) {
        CInteraction.reply(`Invalid from_color provided!`);
        return;
    }

    const from_color = fc

    const period = CInteraction.options.getInteger('period') || undefined;
    const cycles = CInteraction.options.getInteger('cycles')  || undefined;

    const result = await lifx.pulseEffect(owner, targetSelector, {
        color: c,
        from_color: from_color,
        period: period,
        cycles: cycles,
        power_on: true
    });

    if (result === `error`) {
        CInteraction.reply(`An error occured while pulsing your light(s)!`);
        return;
    } else {
        CInteraction.reply(`Light(s) successfully pulsed!`);
        return;
    }
}