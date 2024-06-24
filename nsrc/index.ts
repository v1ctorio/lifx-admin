import Discord from 'discord.js';
import { config } from 'dotenv';
import loadDB from './db/loaddb';

config();
const redis = loadDB();