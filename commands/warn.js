import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';

const command = {
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription('Warn a guild member')
		.addUserOption(option =>
			option
				.setName('member')
				.setDescription('The guild member to warn')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('The reason for the warning')
				.setRequired(false)),
	async execute(interaction) {
		await createWarningsFile();
		if (interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
			const member = interaction.options.getMember('member');
			const reason = interaction.options.getString('reason') || '';
			const warnChannel = interaction.guild.channels.cache.find(channel => channel.name === 'warn');

			if (!warnChannel) {
				return interaction.reply('A channel named "warn" does not exist in this guild. Please create one and try again.');
			}

			try {
				const data = JSON.parse(await readFile('warnings.json', 'utf-8'));
				if (!data[interaction.guildId]) {
					data[interaction.guildId] = {};
				}

				if (!data[interaction.guildId][member.id]) {
					data[interaction.guildId][member.id] = 1;
				}
				else {
					data[interaction.guildId][member.id]++;
				}

				await writeFile('warnings.json', JSON.stringify(data));

				const totalWarnings = data[interaction.guildId][member.id];
				await warnChannel.send(`${member} has been warned for reason: ${reason}. They now have ${totalWarnings} warning(s).`);
				interaction.reply({ content: `${member} has been warned.`, ephemeral: false });
			}
			catch (error) {
				console.error(error);
				interaction.reply({ content: 'An error occurred while warning the user.', ephemeral: true });
			}
		}
	},
};

async function createWarningsFile() {
	if (!existsSync('warnings.json')) {
		await writeFile('warnings.json', '{}', (error) => {
			if (error) {
				console.error(`Error creating warnings.json: ${error}`);
			}
		});
	}
}

export default command;
