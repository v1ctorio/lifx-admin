import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';

import { SlashCommandBuilder,SlashCommandStringOption,SlashCommandIntegerOption, SlashCommandSubcommandBuilder, SlashCommandBooleanOption} from '@discordjs/builders';
const basicColors = ['white','red','orange','yellow','cyan','green','blue','purple','pink'];

config();
const {CLIENT_ID, DISCORD_TOKEN } = process.env;
if (!CLIENT_ID || !DISCORD_TOKEN) {
    throw new Error("Missing environment variables, set up your .env!");
}

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
const colorOption = new SlashCommandStringOption()
    .setName("color")
    .setDescription("The color to set the light to.")
    basicColors.forEach((color) => {
        colorOption.addChoices({name:color,value:color})
    })
const brightnessOption = new SlashCommandIntegerOption()
    .setName("brightness")
    .setDescription("The brightness to set the light to.")
    .setMaxValue(100)
    .setMinValue(0)

const periodOption = new SlashCommandIntegerOption()
    .setName("period")
    .setDescription("The time in seconds for one cycle of the effect.")
    .setRequired(false)
    .setMinValue(0)
    .setMaxValue(3155760000)
const cyclesOption = new SlashCommandIntegerOption()
    .setName("cycles")
    .setDescription("The number of times to repeat the effect.")
    .setRequired(false)
    

  
const color_fromOption = new SlashCommandStringOption()
    .setName("from_color")
    .setDescription('The color to start the effect from.')
    basicColors.forEach((color) => {
        color_fromOption.addChoices({name:color,value:color})
    })
const persistOption = new SlashCommandBooleanOption()
    .setName("persist")
    .setDescription("If true, leave the last effect color.")


const commands = [
    new SlashCommandBuilder()
        .setName("toggle")
        .setDescription("Toggle a light.")
        .addStringOption(selectorOption),
    new SlashCommandBuilder()
        .setName("refresh")
        .setDescription("Refresh the cache of your LIFX account. Use it if you have recently added or removed devices.")
        ,
    new SlashCommandBuilder()
        .setName("linklifx")
        .setDescription("Link your discord account to your LIFX account."),
    new SlashCommandBuilder()
        .setName("scene")
        .setDescription("Manage the scenes from the authenticated account.")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("list")
                .setDescription("List scenes belonging to the authenticated account.")
                    )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("activate")
                .setDescription("Activates a scene from the authenticated account.")
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("scene")
                        .setDescription("The scene to activate.")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        ),
    new SlashCommandBuilder()
        .setName("light")
        .setDescription("Manage the lights from the authenticated account.")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("list")
                .setDescription("List lights belonging to the authenticated account.")
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("state")
                .setDescription("Set the state of a selector.")
                .addStringOption(selectorOption)
                .addStringOption(colorOption)
                .addIntegerOption(durationOption)
                .addBooleanOption(
                    new SlashCommandBooleanOption()
                        .setName("power")
                        .setDescription("Whether to turn the light on or off.")
                         
                )
                .addIntegerOption(brightnessOption)
                .addIntegerOption(
                    new SlashCommandIntegerOption()
                        .setName("infrared")
                        .setDescription("The maximum brightness of the infrared channel.")
                        .setMinValue(0)
                        .setMaxValue(100)
                )
        ),
    new SlashCommandBuilder()
        .setName("color")
        .setDescription("Change the color of a selector.")
        .addStringOption(selectorOption)
        .addStringOption(colorOption),
    new SlashCommandBuilder()
        .setName("dim")
        .setDescription("Dim a light.")
        .addStringOption(selectorOption)
        .addIntegerOption(brightnessOption),
    new SlashCommandBuilder()
        .setName("effect")
        .setDescription("Apply an effect to a selector.")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("off")
                .setDescription("Turns off any running effects on the account.")
                .addStringOption(selectorOption)
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("pulse")
                .setDescription("Performs a pulse effect by quickly flashing between the given colors.")
                .addStringOption(selectorOption)
                .addStringOption(colorOption)
                .addStringOption(color_fromOption)
                .addIntegerOption(periodOption)
                .addIntegerOption(cyclesOption)
                .addBooleanOption(
                    persistOption
                )
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("flame")
                .setDescription("Performs a flame effect on the tiles in your selector.")
                .addStringOption(selectorOption)
                .addIntegerOption(durationOption)
                .addIntegerOption(periodOption.setDescription("This controls how quickly the flame runs. Measured in seconds. A lower number means it is faster"))
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("move")
                .setDescription("Performs a move effect on a linear device with zones.")
                .addStringOption(selectorOption)
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("direction")
                        .setDescription("Move direction, can be forward or backward.")
                        .addChoices(
                            {name:'forward',value:'forward'},
                            {name:'backward',value:'backward'}
                        )
                )
                .addIntegerOption(periodOption)
                .addIntegerOption(cyclesOption)
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("breathe")
                .setDescription("Performs a breathe effect by slowly fading between the given colors.")
                .addStringOption(selectorOption)
                .addStringOption(colorOption)
                .addStringOption(color_fromOption)
                .addIntegerOption(periodOption)
                .addIntegerOption(cyclesOption)
                .addBooleanOption(persistOption)
                .addIntegerOption(
                    new SlashCommandIntegerOption()
                        .setName("peak")
                        .setDescription("Defines where in a period the target color is at its maximum.")
                        .setMinValue(0)
                        .setMaxValue(100)
                )
        )

        
];





for (const command of commands) {
    cmds.push(command);
    console.log(`Successfully added command ${command.name}`);
}



const rest = new REST().setToken(DISCORD_TOKEN);
try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands 
    const data = await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands },
    ) as Array<any>

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
} catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
}
