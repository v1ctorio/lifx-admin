import Discord from 'discord.js';
import { config } from 'dotenv';
import loadDB from './db/loaddb.js';
import { DatabaseClient } from './db/redis.js';
import { RedisClientType } from 'redis';
import { LIFXAPIClient } from './api/APIClient.js';
import link from './discord/link.js';
import { handleAutocomplete } from './discord/handleAutocomplete.js';
import { listLightsCommand } from './discord/slash/lights.js';
import { toogleCommand as toggleCommand } from './discord/slash/toogle.js';
import { dimCommand } from './discord/slash/dim.js';
import { colorCommand } from './discord/slash/color.js';

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
        if (interaction.commandName === 'list') {
            await listLightsCommand(interaction, RClient, LClient);
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
    }
    if (interaction.isAutocomplete()) {
        if (/*check if it's selector autocomplete*/true) {
            handleAutocomplete(interaction, RClient, LClient)
        }
    }
 });

DClient.login(process.env.DISCORD_TOKEN);