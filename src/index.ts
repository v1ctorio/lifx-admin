import Discord from 'discord.js';
import { config } from 'dotenv';
import loadDB from './db/loaddb.js';
import { DatabaseClient } from './db/redis.js';
import { RedisClientType } from 'redis';
import { LIFXAPIClient } from './api/APIClient.js';
import register from './commands/register.js';

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
            await interaction.reply('Pong!');
        }
        if (interaction.commandName === 'login') {
            await register(interaction, RClient);
        }
    }
 });

DClient.login(process.env.DISCORD_TOKEN);