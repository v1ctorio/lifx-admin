import { Interaction } from "discord.js";

export function handleNotLinked(CInteraction: Interaction) {
    if (CInteraction.isAutocomplete()) {
        return;
    }
    CInteraction.reply(`This user has not linked their lifx account yet! Register with \`/linklifx\`!`);
}