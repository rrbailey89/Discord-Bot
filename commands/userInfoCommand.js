import { UserContextMenuCommandInteraction, EmbedBuilder, ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';

const command = {
	data: new ContextMenuCommandBuilder()
		.setName('User Information')
		.setType(ApplicationCommandType.User),

	async execute(interaction) {
		if (!(interaction instanceof UserContextMenuCommandInteraction)) {return;}

		const member = interaction.targetMember;
		const roles = member.roles.cache.filter(role => role.name !== '@everyone');
		const rolesValue = roles.size ? roles.map(role => role.toString()).join(' ') : 'No Roles Assigned';
		const embed = new EmbedBuilder()
			.setTitle(`User Info - ${member.displayName}`)
			.setImage(member.user.avatarURL({ dynamic: true, size: 4096 }))
			.addFields({
				name: 'Discord Name',
				value: `${member.user.tag}`,
				inline: true,
			}, {
				name: 'Nickname',
				value: `${member.displayName}`,
				inline: true,
			}, {
				name: 'Account Created On',
				value: `${member.user.createdAt.toLocaleString()}`,
				inline: true,
			}, {
				name: 'Joined Server On',
				value: `${member.joinedAt.toLocaleString()}`,
				inline: true,
			}, {
				name: 'Roles',
				value: `${rolesValue}`,
				inline: true,
			})
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	},
};

export default command;