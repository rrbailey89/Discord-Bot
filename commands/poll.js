import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const command = {
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('Create a poll')
		.addStringOption(option =>
			option
				.setName('question')
				.setDescription('The question to ask')
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName('duration')
				.setDescription('The duration of the poll in minutes (optional, up to 30 minutes)')
				.setRequired(false)),
	async execute(interaction) {
		const question = interaction.options.getString('question');
		const options = [];

		for (let i = 1; i <= 10; i++) {
			const option = interaction.options.getString(`option${i}`);
			if (option) {
				options.push(option);
			}
		}

		if (options.length < 2) {
			await interaction.reply('You need to provide at least 2 options');
			return;
		}

		const emojis = [
			'1️⃣',
			'2️⃣',
			'3️⃣',
			'4️⃣',
			'5️⃣',
			'6️⃣',
			'7️⃣',
			'8️⃣',
			'9️⃣',
			'🔟',
		];

		const embed = new EmbedBuilder()
			.setTitle(question)
			.setColor('#0099ff')
			.setDescription(
				options.map((option, index) => `${emojis[index]} ${option}`).join('\n\n'))
			.setFooter({
				text: 'React with the corresponding emoji to vote',
			});

		const pollMessage = await interaction.reply({
			content: `Poll created by ${interaction.user.username}:`,
			embeds: [embed],
			fetchReply: true,
		});

		for (let i = 0; i < options.length; i++) {
			await pollMessage.react(emojis[i]);
		}

		const duration = interaction.options.getInteger('duration');
		if (duration) {
			const durationInSeconds = Math.min(duration * 60, 30 * 60);
			const results = options.map((option) => ({
				option,
				count: 0,
				voters: [],
			}));

			setTimeout(async () => {
				const updatedMessage = await interaction.channel.messages.fetch(pollMessage.id);
				const reactions = updatedMessage.reactions.cache;

				let totalVotes = 0;
				for (const reaction of reactions.values()) {
					const emojiIndex = emojis.indexOf(reaction.emoji.name);
					if (emojiIndex !== 0) {
						const {
							count,
							voters,
						} = results[emojiIndex];
						const reactionUsers = await reaction.users.fetch();
						reactionUsers.forEach((user) => {
							if (user.bot) return;
							const member = interaction.guild.members.cache.get(user.id);
							const voterName = member.nickname || user.username;
							if (!voters.includes(voterName)) {
								voters.push(voterName);
							}
						});
						results[emojiIndex].count = count + reaction.count - 1;
						totalVotes += reaction.count - 1;
					}
				}

				const totalText = `Total votes: ${totalVotes}`;
				const resultsText = results
					.map(({ option, count, voters }) => {
						if (count > 0) {
							return `${option}: ${count} votes (${voters.join(', ')})`;
						}
						else {
							return `${option}: ${count} votes`;
						}
					})
					.join('\n\n');

				const updateEmbed = new EmbedBuilder()
					.setTitle('Poll Results')
					.setColor('#0099ff')
					.setDescription(`${totalText}\n\n${resultsText}`)
					.setFooter({
						text: 'Poll ended',
					});

				await pollMessage.edit({
					content: 'Poll has ended.',
					embeds: [updateEmbed],
				});
			}, (durationInSeconds * 1000));
		}
	},
};

for (let i = 1; i <= 10; i++) {
	command.data.addStringOption(option =>
		option
			.setName(`option${i}`)
			.setDescription(`Option ${i}`)
			.setRequired(false));
}

export default command;