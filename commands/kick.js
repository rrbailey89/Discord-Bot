import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

const command = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Kicks a member from the server.')
		.addUserOption(option =>
			option
				.setName('member')
				.setDescription('The member to kick.')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('The reason for kicking the member.')
				.setRequired(true)),
	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
			await interaction.reply('You do not have permission to kick members.');
			return;
		}

		// Get the member to kick
		const member = interaction.options.getMember('member');

		// Check if the bot can kick the member
		if (!member.kickable) {
			await interaction.reply('The bot cannot kick this user.');
			return;
		}

		// Get the reason for kicking the member
		const reason = interaction.options.getString('reason');

		try {
			// Kick the member
			await member.kick(reason);

			// Log the kick in the server's audit log
			const logEmbed = new EmbedBuilder()
				.setTitle(`Member Kicked: ${member.displayName}`)
				.addFields({
					name: 'Member',
					value: `${member.toString()}`,
					inline: true,
				}, {
					name: 'Moderator',
					value: `${interaction.user.toString()}`,
					inline: true,
				}, {
					name: 'Reason',
					value: `${reason}`,
					inline: true,
				})
				.setColor('#ff0000')
				.setTimestamp();

			const auditlog = await interaction.guild.fetchAuditLogs({
				type: 20,
				limit: 1,
			});

			const auditLogEntry = auditlog.entries.first();
			if (auditLogEntry) {
				logEmbed.setFooter({
					text: `Kicked by ${auditLogEntry.executor.tag}`,
					iconURL: auditLogEntry.executor.avatarURL({
						dynamic: true,
					}),
				});
			}

			const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'audit-log');
			if (logChannel) {
				await logChannel.send({
					embeds: [logEmbed],
				});
			}

			await interaction.reply(`${member.user.tag} has been kicked.`);
		}
		catch (error) {
			console.error(error);
			await interaction.reply('There was an error trying to kick the member.');
		}
	},
};

export default command;
