import { Interaction } from "discord.js";

export function notRegistered(CInteraction: Interaction) {
    if (CInteraction.isAutocomplete()) {
        return;
    }
    CInteraction.reply(`This user has not registered their lights yet! Register with \`/register\`!`);
}