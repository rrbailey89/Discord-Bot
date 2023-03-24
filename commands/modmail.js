import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';

const command = {
	data: new SlashCommandBuilder()
		.setName('modmail')
		.setDescription('Open a modmail ticket')
		.addSubcommand(subcommand =>
			subcommand
				.setName('open')
				.setDescription('Open a modmail ticket')
				.addStringOption(option =>
					option
						.setName('message')
						.setDescription('Your modmail message')
						.setRequired(true))),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'open') {
			const message = interaction.options.getString('message');
			const user = interaction.user;
			const guild = interaction.guild;

			try {
				const privateChannel = await createPrivateChannel(guild, user);
				await sendModmailMessage(privateChannel, user, message);
				await waitForUserReaction(privateChannel, user);

				await interaction.reply({ content: `Modmail ticket created. Please check the ${privateChannel} in the server.`, ephemeral: true });
			}
			catch (error) {
				console.error('Error handling modmail:', error);
				await interaction.reply({ content: 'There was an error creating the modmail ticket. Please try again later.', ephemeral: true });
			}
		}
	},
};

async function createPrivateChannel(guild, user) {
	const categoryName = `${user.username}-${user.discriminator}`;

	const privateChannel = await guild.channels.create({
		name: categoryName,
		type: ChannelType.GuildText,
		permissionOverwrites: [
			{
				id: guild.roles.everyone,
				deny: [PermissionFlagsBits.ViewChannel],
			},
			{
				id: user.id,
				allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
			},
		],
	});

	return privateChannel;
}


async function sendModmailMessage(channel, user, message) {
	const modmailMessage = await channel.send(`Modmail from ${user.tag}:\n\n${message}\n\nTo close this ticket, react with ✉️.`);
	await modmailMessage.react('✉️');
}

async function waitForUserReaction(channel, user) {
	const filter = (reaction, reactor) => reaction.emoji.name === '✉️' && reactor.id === user.id;

	// Fetch the modmail message
	const messages = await channel.messages.fetch({ limit: 1 });
	const modmailMessage = messages.first();

	// Create a reaction collector for the modmail message
	const collector = modmailMessage.createReactionCollector({ filter, max: 1 });

	collector.on('collect', async () => {
		await closePrivateChannel(channel);
	});
}

async function closePrivateChannel(privateChannel) {
	try {
		await privateChannel.delete('Modmail ticket closed');
	}
	catch (error) {
		console.error('Error deleting private channel:', error);
	}
}

export default command;
