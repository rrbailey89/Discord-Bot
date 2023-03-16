import { REST, Routes } from 'discord.js';
import { clientId, token } from './config.js';
import fs from 'fs';
import path from 'node:path';

const commands = [];
const commandsPath = path.join(process.cwd(), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const loadCommands = async () => {
	for (const file of commandFiles) {
		const commandModule = await import(`./commands/${file}`);
		const command = commandModule.default;
		commands.push(command.data.toJSON());
	}
};

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
	try {
		await loadCommands();
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	}
	catch (error) {
		console.error(error);
	}
})();