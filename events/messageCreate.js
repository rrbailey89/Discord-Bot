import fs from 'fs';
import { Events, PermissionFlagsBits } from 'discord.js';

const forbiddenWords = fs.readFileSync('./forbidden_words.txt', 'utf-8').toLowerCase().split(/[\n\r]+/).filter(word => word.trim() !== '');

function cleanMessageContent(content) {
	const leetSpeakMap = {
		'4': 'a',
		'@': 'a',
		'8': 'b',
		'3': 'e',
		'6': 'g',
		'9': 'g',
		'!': 'i',
		'1': 'l',
		'0': 'o',
		'5': 's',
		'7': 't',
		'2': 'z',
	};

	return content.toLowerCase()
		.replace(/[^a-z0-9\s]+/g, '')
		.replace(/[48@]|\(+/g, 'a')
		.replace(/6|9/g, 'g')
		.replace(/!|1/g, 'i')
		.split('')
		.map(char => leetSpeakMap[char] || char)
		.join('');
}

export default {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot) return;

		const member = message.member;
		if (!member || member.permissions.has(PermissionFlagsBits.Administrator)) return;

		const cleanedContent = cleanMessageContent(message.content);

		const detectedWords = forbiddenWords.filter(word => cleanedContent.includes(word));

		if (detectedWords.length > 0) {
			try {
				await message.delete();

				await member.timeout(2 * 60 * 1000, 'Used forbidden words');

				await message.author.send(`Your message in ${message.guild.name} was removed because it contained the forbidden word(s): ${detectedWords.join(', ')}. Please avoid using these words in the server. You have been timed out for 2 minutes.`);
			}
			catch (error) {
				console.error(`Error handling message with forbidden words: ${error}`);
			}
		}
	},
};
