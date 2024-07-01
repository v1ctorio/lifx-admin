import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export function AboutCommand(CInteraction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
        .setAuthor({
            name: `V1ctorio`,
            //iconURL: `https://cdn.discordapp.com/avatars/904669014658256937/6bd27636a56f051b1d7442b2a5a35f13?size=1024`,
            iconURL: `https://avatars.githubusercontent.com/u/74506415?v=4`,
            url: `https://github.com/v1ctorio`
        })
        .setTitle(`LIFX Bot`)
        .setColor(`#784af5`)
        .setURL(`https://github.com/v1ctorio/lifx-admin`)
        .setDescription(`
        Welcome to LIFX bot, this is a bot that allows you to control your LIFX lights from Discord.
        Get started by linking your LIFX account with the </linklifx:1255634742439575726> command.


        This bots lets you control lights, scenes and apply effects within discord. Report any error or bug in the [GitHub issues](https://github.com/v1ctorio/lifx-admin/issues).

        Also, this bot is completley open source, you can find the source and how to set it up yourself in [GitHub](https://github.com/v1ctorio/lifx-admin).

        Thank you for using LIFX bot! I hope you like it.
        `)

    CInteraction.reply({ embeds: [embed] });
}