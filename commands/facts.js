import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const command = {
	data: new SlashCommandBuilder()
		.setName('facts')
		.setDescription('Get interesting facts!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('cat')
				.setDescription('Get a random cat fact!'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('dog')
				.setDescription('Get a random dog fact!'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('chucknorris')
				.setDescription('Get a random Chuck Norris fact!'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('number')
				.setDescription('Get a random number fact!'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('useless')
				.setDescription('Get a random useless fact!'),
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		if (subcommand === 'cat') {
			try {
				const response = await fetch('https://catfact.ninja/fact');
				const data = await response.json();

				const catFactEmbed = new EmbedBuilder()
					.setColor('#0099ff')
					.setTitle('Random Cat Fact')
					.setDescription(data.fact);

				await interaction.reply({ embeds: [catFactEmbed] });
			}
			catch (error) {
				console.error(error);
				await interaction.reply('There was an error trying to get a cat fact!');
			}
		}
		else if (subcommand === 'dog') {
			try {
				const response = await fetch('https://dog-api.kinduff.com/api/facts');
				const data = await response.json();

				const dogFactEmbed = new EmbedBuilder()
					.setColor('#0099ff')
					.setTitle('Random Dog Fact')
					.setDescription(data.facts[0]);

				await interaction.reply({ embeds: [dogFactEmbed] });
			}
			catch (error) {
				console.error(error);
				await interaction.reply('There was an error trying to get a dog fact!');
			}
		}
		else if (subcommand === 'chucknorris') {
			try {
				const response = await fetch('https://api.chucknorris.io/jokes/random');
				const data = await response.json();

				const chuckNorrisFactEmbed = new EmbedBuilder()
					.setColor('#0099ff')
					.setTitle('Random Chuck Norris Fact')
					.setDescription(data.value);

				await interaction.reply({ embeds: [chuckNorrisFactEmbed] });
			}
			catch (error) {
				console.error(error);
				await interaction.reply('There was an error trying to get a Chuck Norris fact!');
			}
		}
		else if (subcommand === 'number') {
			try {
				const response = await fetch('http://numbersapi.com/random/trivia');
				const data = await response.text();

				const numberFactEmbed = new EmbedBuilder()
					.setColor('#0099ff')
					.setTitle('Random Number Fact')
					.setDescription(data);

				await interaction.reply({ embeds: [numberFactEmbed] });
			}
			catch (error) {
				console.error(error);
				await interaction.reply('There was an error trying to get a number fact!');
			}
		}
		else if (subcommand === 'useless') {
			try {
				const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
				const data = await response.json();

				const uselessFactEmbed = new EmbedBuilder()
					.setColor('#0099ff')
					.setTitle('Random Useless Fact')
					.setDescription(data.text);

				await interaction.reply({ embeds: [uselessFactEmbed] });
			}
			catch (error) {
				console.error(error);
				await interaction.reply('There was an error trying to get a useless fact!');
			}
		}

	},
};

export default command;