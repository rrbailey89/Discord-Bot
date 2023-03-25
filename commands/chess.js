import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { Chess } from 'chess.js';
import fetch from 'node-fetch';
import ChessImageGenerator from 'chess-image-generator';

async function getStockfishMove(fen) {
  const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.pvs && data.pvs.length > 0) {
      return data.pvs[0].moves.split(" ")[0];
    } else {
      throw new Error("No move found");
    }
  } catch (error) {
    console.error("Error fetching move from Lichess API:", error);
    throw error;
  }
}

async function generateBoardImage(fen) {
  const imageGenerator = new ChessImageGenerator({
    size: 400,
  });

  await imageGenerator.loadFEN(fen);
  const buffer = await imageGenerator.generateBuffer();
  return buffer;
}

const game = new Chess();

const command = {
  data: new SlashCommandBuilder()
    .setName('chess')
    .setDescription('Play chess against Stockfish')
    .addStringOption(option =>
      option.setName('move')
        .setDescription('Your chess move in SAN notation')
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      // Process player's move
      const move = interaction.options.getString('move');
      const moveResult = game.move(move, { sloppy: true });

      if (moveResult === null) {
        await interaction.reply(`Invalid move: ${move}. Please try again.`);
        return;
      }

      console.log('Player move:', moveResult);

      // Get the best move from Stockfish
      const stockfishMove = await getStockfishMove(game.fen());
      console.log('Stockfish move:', stockfishMove);

      // Make the Stockfish move
      const stockfishMoveResult = game.move(stockfishMove, { sloppy: true });

      // Generate the updated board image
      const boardImageBuffer = await generateBoardImage(game.fen());
      const boardImageAttachment = new AttachmentBuilder(boardImageBuffer, { name: 'chessboard.png' });

      // Send the updated board state
      await interaction.reply({
        content: `Stockfish played ${stockfishMove}:`,
        files: [boardImageAttachment],
      });

    } catch (error) {
      console.error('Error executing chess command:', error);
      await interaction.reply('There was an error processing your move. Please try again.');
    }
  },
};

export default command;
