import { SlashCommandBuilder } from 'discord.js';

const command = {
	data: new SlashCommandBuilder()
		.setName('grantrole')
		.setDescription('Grant or remove a role from a user')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The user to grant or remove the role from')
				.setRequired(true))
		.addRoleOption(option =>
			option
				.setName('role')
				.setDescription('The role to grant or remove from the user')
				.setRequired(true)),

	async execute(interaction) {
		const roleOption = interaction.options.getRole('role');
		const userOption = interaction.options.getUser('user');

		const roleID = roleOption.id;
		const userID = userOption.id;

		const guild = interaction.guild;
		const member = await guild.members.fetch(userID);
		const role = guild.roles.cache.get(roleID);

		if (member.roles.cache.has(roleID)) {
			await member.roles.remove(role);
			console.log(`[INFO] Removed role ${role.name} from user <@${userID}>`);

			await interaction.reply(`Removed role ${role.name} from user <@${userID}>`);
			setTimeout(() => {
				interaction.deleteReply();
			}, 5000);
		}
		else {
			await member.roles.add(role);
			console.log(`[INFO] Added role ${role.name} to user <@${userID}>`);

			await interaction.reply(`Added role ${role.name} to user <@${userID}>`);
			setTimeout(() => {
				interaction.deleteReply();
			}, 5000);
		}
	},
};

export default command;