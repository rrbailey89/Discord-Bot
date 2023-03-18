import { Events } from 'discord.js';
export default {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction, interaction.client);
			}
			catch (error) {
				console.error(`Error executing ${interaction.commandName}`);
				console.error(error);
			}
		}
		else if (interaction.isButton()) {
			const command = interaction.client.commands.get('rules');
			if (command && command.interactions && command.interactions.handleButtonInteraction) {
				try {
					await command.interactions.handleButtonInteraction(interaction, interaction.client);
				}
				catch (error) {
					console.error(`Error executing ${interaction.commandName}`);
					console.error(error);
				}
			}
		}
	},
};