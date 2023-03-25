import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

const command = {
	data: new SlashCommandBuilder()
		.setName('clean')
		.setDescription('Remove N messages or messages from a specific member')
		.addSubcommand(subcommand =>
			subcommand
				.setName('general')
				.setDescription('Remove messages')
				.addIntegerOption(option =>
					option
						.setName('amount')
						.setDescription('The number of messages to delete (up to 14 days old up to 100 at a time')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('member')
				.setDescription('Remove messages from a specific member')
				.addUserOption(option =>
					option
						.setName('target')
						.setDescription('The member whose messages to delete')
						.setRequired(true))
				.addIntegerOption(option =>
					option
						.setName('amount')
						.setDescription('The number of messages to delete (up to 14 days old up to 100 at a time')
						.setRequired(true))),
	async execute(interaction) {
		if (!interaction.member.permissions.has([PermissionFlagsBits.ManageMessages])) {
			await interaction.reply('You do not have permission to use this command.');
			return;
		}

		const amount = interaction.options.getInteger('amount');
		const target = interaction.options.getUser('target');
		const subcommand = interaction.options.getSubcommand();

		let deletedCount = 0;

		if (subcommand === 'member') {
			const messagesToDelete = new Map();
			let lastId;

			while (messagesToDelete.size < amount) {
				const options = { limit: 100 };
				if (lastId) options.before = lastId;
				const messages = await interaction.channel.messages.fetch(options);

				if (messages.size === 0) break;

				const filtered = messages.filter(msg => msg.author.id === target.id);
				filtered.forEach(msg => {
					if (messagesToDelete.size < amount) {
						messagesToDelete.set(msg.id, msg);
					}
				});

				lastId = messages.last().id;
			}

			const messagesToDeleteCollection = messagesToDelete.values().next().value.channel.client.channels.resolve(interaction.channel.id).messages.cache.filter(message => messagesToDelete.has(message.id));
			const deletedMessages = await interaction.channel.bulkDelete(messagesToDeleteCollection);
			deletedCount = deletedMessages.size;
		}
		else if (subcommand === 'general') {
			// Fetch and delete the specified number of messages without filtering by a specific member
			const messages = await interaction.channel.messages.fetch({ limit: amount });
			const deletedMessages = await interaction.channel.bulkDelete(messages);
			deletedCount = deletedMessages.size;
		}

		await interaction.reply(`Deleted ${deletedCount} message(s).`);
		setTimeout(() => {
			interaction.deleteReply();
		}, 5000);
	},


};

export default command;
