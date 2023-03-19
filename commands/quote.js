import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import fs from 'fs';

const quotesFileName = './quotes.json';

const command = {
	data: new SlashCommandBuilder()
		.setName('quote')
		.setDescription('Memorable quotes from the server')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add a quote')
				.addStringOption(option =>
					option
						.setName('text')
						.setDescription('The quote to add')
						.setRequired(false))
				.addStringOption(option =>
					option
						.setName('author')
						.setDescription('The author of the quote')
						.setRequired(false))
				.addStringOption(option =>
					option
						.setName('message_id')
						.setDescription('The message ID for the quote')
						.setRequired(false)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('random')
				.setDescription('Get a random quote'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('List all quotes'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('show')
				.setDescription('Show a specific quote')
				.addIntegerOption(option =>
					option
						.setName('quote_id')
						.setDescription('The number of the quote to show')
						.setRequired(true))),

	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

		if (!fs.existsSync(quotesFileName)) {
			fs.writeFileSync(quotesFileName, JSON.stringify([]));
		}

		const quotes = JSON.parse(fs.readFileSync(quotesFileName));

		if (subcommand === 'add') {
			const text = interaction.options.getString('text');
			const author = interaction.options.getString('author');
			const messageId = interaction.options.getString('message_id');

			if (messageId) {
				try {
					const message = await interaction.channel.messages.fetch(messageId);
					const quoteText = message.content;
					const quoteAuthor = message.author.username;

					const newQuoteId = quotes.length > 0 ? Math.max(...quotes.map(q => q.id)) + 1 : 1;
					const newQuote = { id: newQuoteId, text: quoteText, author: quoteAuthor };

					quotes.push(newQuote);
					fs.writeFileSync(quotesFileName, JSON.stringify(quotes));

					await interaction.reply(`Quote added: "${quoteText}" - ${quoteAuthor}`);
				}
				catch (error) {
					await interaction.reply('Could not fetch message with the provided ID.');
				}
			}
			else {
				const newQuoteId = quotes.length > 0 ? Math.max(...quotes.map(q => q.id)) + 1 : 1;
				const newQuote = { id: newQuoteId, text, author };

				quotes.push(newQuote);
				fs.writeFileSync(quotesFileName, JSON.stringify(quotes));

				await interaction.reply(`Quote added: "${text}" - ${author}`);
			}
		}
		else if (subcommand === 'random') {
			if (quotes.length === 0) {
				await interaction.reply('There are no quotes to show.');
				return;
			}

			const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
			const quoteEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setDescription(`"${randomQuote.text}"`)
				.setFooter({ text:`- ${randomQuote.author}` });

			await interaction.reply({ embeds: [quoteEmbed] });
		}
		else if (subcommand === 'list') {
			if (quotes.length === 0) {
				await interaction.reply('There are no quotes to list.');
				return;
			}

			const quoteList = quotes
				.map((quote, index) => `${index + 1}. "${quote.text}" - ${quote.author}`)
				.join('\n');
			const quoteListEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle('Quotes')
				.setDescription(quoteList);

			await interaction.reply({ embeds: [quoteListEmbed] });
		}
		else if (subcommand === 'show') {
			const id = interaction.options.getInteger('quote_id');
			const quote = quotes.find(q => q.id === id);

			if (!quote) {
				await interaction.reply('Could not find a quote with the provided ID.');
				return;
			}

			const quoteEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setDescription(`"${quote.text}"`)
				.setFooter({ text: `- ${quote.author}` });

			await interaction.reply({ embeds: [quoteEmbed] });
		}
	},
};

export default command;