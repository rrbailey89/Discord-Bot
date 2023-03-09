const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

let config;
let commands;

(async () => {
    config = await import('./config.js');
    commands = await import('./commands.js');
    const rest = new REST({ version: '9' }).setToken(config.token);

    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
