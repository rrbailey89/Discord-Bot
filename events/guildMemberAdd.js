import { Events, EmbedBuilder } from 'discord.js';

export default {
	name: Events.GuildMemberAdd,
	async execute(member) {
		// Check if the member's account is less than 1 day old
		const oneDay = 24 * 60 * 60 * 1000;
		const accountAge = new Date().getTime() - member.user.createdAt.getTime();

		if (accountAge < oneDay) {
			try {
				const kickEmbed = new EmbedBuilder()
					.setColor('#0099ff')
					.setTitle('Kicked due to account age being less than 1 day.')
					.setDescription(`Hello ${member.displayName}, welcome to the server! Unfortunately, your account is less than 1 day old and is not allowed on this server. Please try again later.`)
					.setThumbnail(member.guild.iconURL({ dynamic: true }))
					.setTimestamp();

				await member.send({ embeds: [kickEmbed] });

				await member.kick('Account is less than 1 day old');
				console.log(`Kicked ${member.displayName} due to account age being less than 1 day.`);
			}
			catch (error) {
				console.error('Error kicking member:', error);
			}
			return;
		}

		try {
			// Send the welcome message as an Embed and instructions as a DM to the new member
			const welcomeEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle(`Welcome to ${member.guild.name}!`)
				.setDescription(`Hello ${member.displayName}, welcome to the server! Please read the rules in the rules channel and click the button to agree to the rules and assign yourself a role. Only after this will you be able to use text and voice channels.`)
				.setThumbnail(member.guild.iconURL({ dynamic: true }))
				.setTimestamp();

			await member.send({ embeds: [welcomeEmbed] });
		}
		catch (error) {
			console.error('Error sending welcome DM:', error);
		}
	},
};
