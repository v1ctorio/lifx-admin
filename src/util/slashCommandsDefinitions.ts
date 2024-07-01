const { REST, Routes } = require('discord.js');
import { config } from 'dotenv';

import { SlashCommandBuilder,SlashCommandStringOption,SlashCommandIntegerOption} from '@discordjs/builders';

config();

const cmds = [];


const selectorOption = new SlashCommandStringOption()
    .setName("selector")
    .setDescription("The selector to limit which devices will run the effect.")
    .setRequired(true)
    .setAutocomplete(true);

const durationOption = new SlashCommandIntegerOption()
    .setName("duration")
    .setDescription("How long in seconds you want the action to take.")
    .setRequired(false)
    .setMinValue(0)
    .setMaxValue(3155760000)

  

const commands = [
    new SlashCommandBuilder()
        .setName("toggle")
        .setDescription("Toggle a light")
        .addStringOption(selectorOption),
        
];





for (const command of commands) {
    cmds.push(command);
    console.log(`Successfully added command ${command.name}`);
}



const rest = new REST().setToken(process.env.DISCORD_TOKEN);
try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
        Routes.applicationCommands(process.env.clientId),
        { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
} catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
}
