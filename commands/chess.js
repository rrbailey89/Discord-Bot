import { SlashCommandBuilder } from 'discord.js';
import { Chess } from 'chess.js';
import ChessImageGenerator from 'chess-image-generator';

const boards = new Map();

async function getStockfishMove(fen) {
	const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=1`;

	try {
		const response = await fetch(url);
		const data = await response.json();

		if (data.pvs && data.pvs.length > 0) {
			return data.pvs[0].moves.split(' ')[0];
		}
		else {
			throw new Error('No move found');
		}
	}
	catch (error) {
		console.error('Error fetching move from Lichess API:', error);
		throw error;
	}
}


async function generateBoardImage(fen) {
	const imageGenerator = new ChessImageGenerator({
		size: 360,
		light: 'white',
		dark: 'gray',
		notation: true,
	});

	await imageGenerator.loadFEN(fen);
	return await imageGenerator.generateBuffer();
}

const command = {
	data: new SlashCommandBuilder()
		.setName('chess')
		.setDescription('Play chess against the bot!')
		.addStringOption(option =>
			option
				.setName('move')
				.setDescription('Your move in algebraic notation (e.g., e2e4)')
				.setRequired(false)),
	async execute(interaction) {
		const userId = interaction.user.id;

		if (!boards.has(userId)) {
			boards.set(userId, new Chess());
		}

		const chess = boards.get(userId);
		const userMove = interaction.options.getString('move');

		if (userMove) {
			const result = chess.move(userMove);

			if (!result) {
				await interaction.reply('Invalid move. Please use proper algebraic notation.');
				return;
			}

			if (chess.isGameOver()) {
				await interaction.reply('Congratulations, you won!');
				boards.delete(userId);
				return;
			}

			const stockfishMove = await getStockfishMove(chess.fen());
			chess.move(stockfishMove);
		}

		const boardImage = await generateBoardImage(chess.fen());
		await interaction.reply({
			content: 'Here\'s the current position:\n',
			files: [{ attachment: boardImage, name: 'chessboard.png' }],
		});

		if (chess.isGameOver()) {
			await interaction.followUp('Game over, you lost!');
			boards.delete(userId);
		}
	},
};

export default command;
