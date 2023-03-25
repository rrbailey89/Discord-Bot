import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

const command = {
	data: new SlashCommandBuilder()
		.setName('setavatar')
		.setDescription('Set the bot\'s avatar')
		.addStringOption(option =>
			option
				.setName('url')
				.setDescription('The URL of the image to use as the avatar')
				.setRequired(true)),

	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
			await interaction.reply('You do not have permission to use this command.');
			return;
		}
		const url = interaction.options.getString('url');

		await interaction.client.user.setAvatar(url);
		await interaction.reply(`Avatar set to ${url}`);

		const reply = await interaction.fetchReply();
		setTimeout(() => {
			reply.delete();
		}, 5000);
	},
};

export default command;
