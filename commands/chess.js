import { SlashCommandBuilder } from 'discord.js';
import { Chess } from 'chess.js';
import ChessImageGenerator from 'chess-image-generator';
import stockfish from 'stockfish';

const boards = new Map();

async function getStockfishMove(fen) {
    return new Promise((resolve, reject) => {
        const engine = stockfish();
        let bestMove = null;

        engine.onmessage = (event) => {
            if (event.startsWith('bestmove')) {
                bestMove = event.split(' ')[1];
                resolve(bestMove);
            }
        };

        engine.postMessage(`position fen ${fen}`);
        engine.postMessage('go depth 15');
    });
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
            content: `Here's the current position:\n`,
            files: [{ attachment: boardImage, name: 'chessboard.png' }],
        });

        if (chess.isGameOver()) {
            await interaction.followUp('Game over, you lost!');
            boards.delete(userId);
        }
    },
};

export default command;
