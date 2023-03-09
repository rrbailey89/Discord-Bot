const {
    REST
} = require('@discordjs/rest');
const {
    Routes
} = require('discord-api-types/v9');
const commands = require('./commands.js');
let config;

(async () => {
    config = await import('./config.js');
})();

const rest = new REST({
    version: '9'
}).setToken(config.token);

(async() => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(config.clientId), {
            body: commands
        }, );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
