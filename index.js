// Import the necessary packages and files
import { Client, Events, EmbedBuilder, PermissionsBitField, GatewayIntentBits } from 'discord.js';
import config from './config.js';
import fs from 'fs';

// Create the client and set the intents (permissions)

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

// When the bot is ready to start, log a message
client.once(Events.ClientReady, c => {
	console.log(`Logged in as ${c.user.tag}`);
});

client.login(config.token);
