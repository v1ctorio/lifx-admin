import Discord from 'discord.js';
import { config } from 'dotenv';
import loadDB from './db/loaddb.js';
import { DatabaseClient } from './db/redis.js';
import { RedisClientType } from 'redis';
import { LIFXAPIClient } from './api/APIClient.js';
import link from './discord/link.js';
import { handleSelectorAutocomplete } from './discord/handleAutocomplete.js';
import { listLightsCommand } from './discord/slash/lights/list.js';
import { toogleCommand as toggleCommand } from './discord/slash/toogle.js';
import { dimCommand } from './discord/slash/dim.js';
import { colorCommand } from './discord/slash/color.js';
import { listScenesCommand } from './discord/slash/scenes/list.js';
import { handleSceneAutocomplete } from './discord/handleScenesAutocomplete.js';
import { activateSceneCommand } from './discord/slash/scenes/activate.js';
import { lightStateCommand } from './discord/slash/lights/state.js';
import { refreshCommand } from './discord/slash/refresh.js';
import { effectOffCommand } from './discord/slash/effect/off.js';
import { PulseEffectCommand } from './discord/slash/effect/pulse.js';
import { FlameEffectCommand } from './discord/slash/effect/flame.js';
import { moveEffectCommand } from './discord/slash/effect/move.js';

config();

const _redisServer = (await loadDB()) as RedisClientType;
const DClient = new Discord.Client({ intents: [Discord.IntentsBitField.Flags.Guilds,] });
const RClient = new DatabaseClient(_redisServer);
const LClient = new LIFXAPIClient(); 

DClient.on('ready', () => {
    console.log(`Logged in as ${DClient?.user?.tag}!`);
});

DClient.on('interactionCreate', async (interaction) => {

    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'lights') {
            const subcommand = interaction.options.getSubcommand(true);
            if (subcommand === 'list') {
                await listLightsCommand(interaction, RClient, LClient);
            }
            if (subcommand === 'state') {
                await lightStateCommand(interaction, RClient, LClient);
            }
        }
        if (interaction.commandName === 'linklifx') {
            await link(interaction, RClient, LClient);
        }
        if (interaction.commandName === 'toggle') {
             await toggleCommand(interaction, RClient, LClient);
        }
        if (interaction.commandName === 'dim') {
            await dimCommand(interaction, RClient, LClient);
        }
        if (interaction.commandName === 'color') {
            await colorCommand(interaction, RClient, LClient);
        }

        if (interaction.commandName === 'scenes') {
            const subcommand = interaction.options.getSubcommand(true);
            if (subcommand === 'list') {
                 await listScenesCommand(interaction, RClient, LClient);
            }
            if (subcommand === 'activate') {
                await activateSceneCommand(interaction, RClient, LClient);
            }
        }
        if (interaction.commandName === 'refresh') {
            await refreshCommand(interaction, RClient, LClient);        
        }

        if (interaction.commandName === 'effect') {
            const subcommand = interaction.options.getSubcommand(true);
            if (subcommand === 'off') {
                await effectOffCommand(interaction, RClient, LClient);
            }
            if (subcommand === 'pulse') {
                await PulseEffectCommand(interaction, RClient, LClient);
            }
            if (subcommand === 'flame') {
                 await FlameEffectCommand(interaction, RClient, LClient);
            }
            if (subcommand === 'move') {
                await moveEffectCommand(interaction, RClient, LClient);
            }
        }
    }
    if (interaction.isAutocomplete()) {
        const opt = interaction.options.getFocused(true).name;
        console.log({opt})
        if (opt == 'selector') { 
            handleSelectorAutocomplete(interaction, RClient, LClient)
        }
        if (opt == 'scene') {
            handleSceneAutocomplete(interaction, RClient, LClient)
        }
    }
 });

DClient.login(process.env.DISCORD_TOKEN);