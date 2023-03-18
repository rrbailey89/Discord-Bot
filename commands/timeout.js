import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';


const command = {
	data: new SlashCommandBuilder()
		.setName('timeout')
		.setDescription('Timeout a member')
		.addUserOption(option =>
			option
				.setName('member')
				.setDescription('The member to timeout')
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName('duration')
				.setDescription('The duration in minutes to timeout the member')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('The reason for the timeout')
				.setRequired(true)),

	async execute(interaction) {

		if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
			await interaction.reply('You do not have permission to timeout members.');
			return;
		}

		const durationInMinutes = interaction.options.getInteger('duration');

		const member = interaction.options.getMember('member');

		const reason = interaction.options.getString('reason');

		if (!member.moderatable) {
			await interaction.reply('The bot cannot timeout this user.');
			return;
		}

		// Convert the duration to milliseconds
		const durationInMilliseconds = durationInMinutes * 60 * 1000;
		console.log(`durationInMilliseconds: ${durationInMilliseconds}`);

		try {
			// Timeout the member
			await member.timeout(durationInMilliseconds, reason);

			// Log the timeout in the server's audit log
			const timeoutEmbed = new EmbedBuilder()
				.setTitle(`Member Timed Out: ${member.displayName}`)
				.addFields({
					name: 'Member',
					value: `${member.toString()}`,
					inline: true,
				}, {
					name: 'Moderator',
					value: `${interaction.user.toString()}`,
					inline: true,
				}, {
					name: 'Duration',
					value: `${durationInMinutes} minutes`,
					inline: true,
				})
				.setColor('#ff0000')
				.setTimestamp();

			const timeoutauditlog = await interaction.guild.fetchAuditLogs({
				type: 24,
				limit: 1,
			});
			const timeoutauditLogEntry = timeoutauditlog.entries.first();
			if (timeoutauditLogEntry) {
				timeoutEmbed.setFooter({
					text: `Timed out by ${timeoutauditLogEntry.executor.tag}`,
					iconURL: timeoutauditLogEntry.executor.avatarURL({
						dynamic: true,
					}),
				});
			}
			const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'audit-log');
			if (logChannel) {
				await logChannel.send({
					embeds: [timeoutEmbed],
				});
			}
			await interaction.reply(`${member.user.tag} has been timed out`);
		}
		catch (error) {
			console.error(error);
			await interaction.reply('There was an error trying to timeout the member.');
		}
	},

};

export default command;