import { SlashCommandBuilder } from 'discord.js';
import scenarios from '../gamescenarios/scenarios.js';

const states = {
	INIT: 'INIT',
	CHARACTER_CREATION: 'CHARACTER_CREATION',
	SCENARIO: 'SCENARIO',
	ACTION: 'ACTION',
};

const gameSessions = new Map();

const command = {
	data: new SlashCommandBuilder()
		.setName('game')
		.setDescription('Start the text-based story game.'),
	async execute(interaction, client) {
		const channelId = interaction.channelId;

		if (gameSessions.has(channelId)) {
			await interaction.reply('A game is already in progress in this channel.');
			return;
		}

		const gameSession = { state: states.INIT };
		gameSessions.set(channelId, gameSession);

		await interaction.reply('Welcome to the text-based story game! Let\'s create your character.');
		gameSession.state = states.CHARACTER_CREATION;

		const character = await handleCharacterCreation(interaction.channel, client);
		gameSession.character = character;
		gameSession.state = states.SCENARIO;

		await displayScenario(interaction.channel, gameSession.character, scenarios[0]);
	},
};
async function handleCharacterCreation(channel, client) {
	const filter = m => m.author.id !== client.user.id;
	const character = {};

	await channel.send('What is your character\'s name?');
	const nameResponse = await channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
	character.name = nameResponse.first().content;

	await channel.send('What is your character\'s age?');
	const ageResponse = await channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
	character.age = parseInt(ageResponse.first().content);

	// Add other character attributes (race, etc.) here

	return character;
}

async function displayScenario(channel, character, scenario, client) {
	// Display the scenario description and available actions
	await channel.send(`${scenario.description}\n\nAvailable actions: ${scenario.actions.map(action => action.input).join(', ')}`);

	// Await user action
	const filter = m => m.author.id !== client.user.id && scenario.actions.some(action => action.input === m.content);
	const userActionResponse = await channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });

	const userInput = userActionResponse.first().content;

	// Handle user action
	await handleUserAction(channel, character, scenario, userInput);
}

async function handleUserAction(channel, character, scenario, userInput) {
	const userAction = scenario.actions.find(action => action.input === userInput);

	if (!userAction) {
		// Invalid action, ask the user to try again or display an error message
		return;
	}

	const nextScenarioId = userAction.result;
	const nextScenario = scenarios.find(sc => sc.id === nextScenarioId);

	if (!nextScenario) {
		// The scenario is not found, handle this error or end the game
		return;
	}

	await displayScenario(channel, character, nextScenario);
}


export default command;
