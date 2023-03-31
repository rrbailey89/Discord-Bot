import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import fs from 'fs';

const command = {
	data: new SlashCommandBuilder()
		.setName('rules')
		.setDescription('Manage server rules.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add a rule to the server.')
				.addStringOption(option =>
					option
						.setName('rule')
						.setDescription('The rule to add.')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Remove a rule from the server.')
				.addIntegerOption(option =>
					option
						.setName('rule-number')
						.setDescription('The number of the rule to remove.')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('populate')
				.setDescription('Populate the rules in a channel.')
				.addChannelOption(option =>
					option
						.setName('channel')
						.setDescription('The channel to populate.')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('repopulate')
				.setDescription('Repopulate the rules in a channel.')
				.addChannelOption(option =>
					option
						.setName('channel')
						.setDescription('The channel to repopulate.')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('button')
				.setDescription('Add a button to the rules embed.')
				.addChannelOption(option =>
					option
						.setName('channel')
						.setDescription('The channel the rules are in.')
						.setRequired(false))
				.addStringOption(option =>
					option
						.setName('button-text')
						.setDescription('The text to display on the button.')
						.setRequired(false))),

	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();
		if (!interaction.member.permissions.has([PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.Administrator])) {
			await interaction.reply('You do not have permission to use this command.');
			return;
		}

		if (subcommand === 'add') {
			const rule = interaction.options.getString('rule');

			try {
				const rules = fs.readFileSync('./rules.txt', 'utf8').split('\n').filter(r => r);
				rules.push(rule);
				fs.writeFileSync('./rules.txt', rules.join('\n') + '\n');
				await interaction.reply(`Rule added: ${rule}`);
			}
			catch (error) {
				console.error(error);
				await interaction.reply('There was an error trying to add the rule.');
			}
		}
		else if (subcommand === 'remove') {
			const ruleNumber = interaction.options.getInteger('rule-number');

			try {
				const rules = fs.readFileSync('./rules.txt', 'utf8').split('\n').filter(r => r);
				if (ruleNumber < 1 || ruleNumber > rules.length) {
					await interaction.reply('Invalid rule number.');
					return;
				}
				const removedRule = rules.splice(ruleNumber - 1, 1);
				fs.writeFileSync('./rules.txt', rules.join('\n') + '\n');
				await interaction.reply(`Rule removed: ${removedRule}`);
			}
			catch (error) {
				console.error(error);
				await interaction.reply('There was an error trying to remove the rule.');
			}
		}
		else if (subcommand === 'populate') {
			const channel = interaction.options.getChannel('channel');
			const rules = fs.readFileSync('./rules.txt', 'utf8').split('\n').filter(r => r);

			const rulesEmbed = new EmbedBuilder()
				.setTitle('Server Rules')
				.setColor('#0099ff')
				.setDescription(rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n\n'));

			await channel.send({ embeds: [rulesEmbed] });
			await interaction.reply(`Rules populated in ${channel.toString()}`);

		}
		else if (interaction.options.getSubcommand() === 'repopulate') {
			// Check if the user has permission to send messages
			if (!interaction.member.permissions.has([PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.Administrator])) {
				await interaction.reply('You do not have permission to use the rules commands.');
				return;
			}

			// Get the channel to repopulate the rules message in
			const channel = interaction.options.getChannel('channel');

			// Find the previous rules message sent by the bot in the specified channel
			const messages = await channel.messages.fetch({ limit: 100 });
			const botMessages = messages.filter(m => m.author.id === client.user.id && m.embeds.length > 0 && m.embeds[0].title === 'Server Rules');
			const previousMessage = botMessages.first();

			// Get the updated rules from the file
			const rules = fs.readFileSync('./rules.txt', 'utf8').split('\n').filter(r => r);

			// Create an embed with the updated rules
			const rulesEmbed = new EmbedBuilder()
				.setTitle('Server Rules')
				.setColor('#0099ff')
				.setDescription(rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n\n'));

			try {
				// Update the previous rules message with the updated rules
				await previousMessage.edit({ embeds: [rulesEmbed] });

				await interaction.reply(`Rules repopulated in ${channel.toString()}`);
			}
			catch (error) {
				console.error(error);
				await interaction.reply('There was an error trying to repopulate the rules.');
			}
		}
		else if (subcommand === 'button') {
			const channel = interaction.options.getChannel('channel');
			const buttonText = interaction.options.getString('button-text');

			const messages = await channel.messages.fetch({ limit: 100 });
			const botMessages = messages.filter(m => m.author.id === client.user.id && m.embeds.length > 0 && m.embeds[0].title === 'Server Rules');
			const rulesMessage = botMessages.first();

			if (!rulesMessage) {
				await interaction.reply('No rules embed was found in the specified channel.');
				return;
			}

			const rulesEmbed = rulesMessage.embeds[0];
			const button = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('rules_button')
						.setLabel(buttonText)
						.setStyle(ButtonStyle.Primary));

			await rulesMessage.edit({ embeds: [rulesEmbed], components: [button] });
			await interaction.reply(`Button added to rules embed in ${channel.toString()}`);
		}

	},
};

command.interactions = {
	async handleButtonInteraction(interaction) {
		if (interaction.customId === 'rules_button') {
			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('raider_button')
						.setLabel('Raider')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('subs_button')
						.setLabel('Subs')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('ewsavage_button')
						.setLabel('EW Savage')
						.setStyle(ButtonStyle.Primary),
				);
			await interaction.reply({ content: 'Select a role to add.', components: [row], ephemeral: true });
		}
		else if (interaction.customId === 'raider_button' || interaction.customId === 'subs_button' || interaction.customId === 'ewsavage_button') {
			let roleName;

			if (interaction.customId === 'raider_button') {
				roleName = 'Raiders';
			}
			else if (interaction.customId === 'subs_button') {
				roleName = 'Subs';
			}
			else if (interaction.customId === 'ewsavage_button') {
				roleName = 'EW Savage';
			}
			const role = interaction.guild.roles.cache.find(r => r.name === roleName);

			if (!role) {
				await interaction.reply({ content: 'The role was not found in this server.', ephemeral: true });
				return;
			}

			const member = interaction.member;
			await member.roles.add(role);
			await interaction.reply({ content: `You have been assigned the ${roleName}.`, ephemeral: true });
		}
	},

};
export default command;