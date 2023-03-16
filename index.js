// Import the necessary packages and files
import { Client, Collection, EmbedBuilder, PermissionsBitField, GatewayIntentBits } from 'discord.js';
import { token } from './config.js';
import fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

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

client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

async function loadCommands() {
	for (const file of commandFiles) {
		const filePath = `./commands/${file}`;
		const commandModule = await import(filePath);
		const command = commandModule.default;

		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}
async function loadEvents() {
	for (const file of eventFiles) {
		const filePath = `./events/${file}`;
		const eventModule = await import(filePath);
		const event = eventModule.default;

		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		}
		else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
}

async function main() {
	await loadCommands();
	await loadEvents();
	client.login(token);
}

main();
