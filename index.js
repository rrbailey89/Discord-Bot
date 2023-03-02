const {
    Client,
    Intents
} = require('discord.js');
const fs = require('fs').promises;
const moment = require('moment-timezone');
const config = require('./config.json');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
});

client.once('ready', async() => {
    console.log('Ready!');
    await loadData();
});

const serenaId = '803867382447079485';
const blameCounts = new Map();
const blameCooldowns = new Map();
let data = {};

async function loadData() {
    try {
        const rawData = await fs.readFile('./data/data.json');
        data = JSON.parse(rawData);
        console.log('Loaded data:', data);

        // Load cooldown data from the data file
        Object.keys(data).forEach(id => {
            blameCooldowns.set(id, data[id].cooldown || 0);
        });
    } catch (err) {
        console.error(err);
    }
}

async function saveData() {
    try {
        // Add cooldown data to the data object
        blameCooldowns.forEach((cooldown, id) => {
            data[id].cooldown = cooldown;
        });

        await fs.writeFile('./data/data.json', JSON.stringify(data));
        console.log('Saved data:', data);
    } catch (err) {
        console.error(err);
    }
}

client.on('rateLimit', (rateLimitInfo) => {
    console.log(`Rate limited: ${JSON.stringify(rateLimitInfo)}`);
});

client.on('interactionCreate', async(interaction) => {
    if (!interaction.isCommand())
        return;

    const command = interaction.commandName;
    const args = interaction.options;

    if (command === 'blame') {
        // Get the server ID from the interaction object
        const serverId = interaction.guild.id;

        // Get the member and count from the interaction options
        const member = interaction.options.getMember('user');
        const count = interaction.options.getInteger('count');

        if (!member) {
            await interaction.reply('You need to specify a user to blame.');
            return;
        }

        if (!count || count < 1 || count > 10) {
            await interaction.reply('You need to specify a number between 1 and 10.');
            return;
        }

        const name = member.nickname || member.user.username;
        const id = member.id;

        const lastBlameTime = blameCooldowns.get(id) || 0;
        if (lastBlameTime !== 0 && Date.now() - lastBlameTime < config.cooldown) {
            const remainingTime = new Date(lastBlameTime + config.cooldown);
            const remainingTimeString = `<t:${Math.floor(remainingTime.getTime() / 1000)}:t>`;
            await interaction.reply({
                content: `You can only blame ${name} once every 5 minutes. Please try again at ${remainingTimeString}.`,
                ephemeral: true
            });
            return;
        }

        const userObj = data[id] || {
            name,
            blameCount: 0,
            blames: {},
            cooldown: 0,
            servers: {}
        };

        // Store the server ID along with the user data
        userObj.servers[serverId] = userObj.servers[serverId] || {
            blameCount: 0,
            blames: {}
        };
        userObj.servers[serverId].blameCount += count;
        userObj.servers[serverId].blames[serenaId] = userObj.servers[serverId].blames[serenaId] || 0;
        userObj.servers[serverId].blames[serenaId] += count;
        data[id] = userObj;

        // Update cooldown data in both the data object and the blameCooldowns map
        const currentTime = Date.now();
        const cooldownTime = currentTime + config.cooldown;
        userObj.cooldown = cooldownTime;
        data[id].cooldown = cooldownTime;
        blameCooldowns.set(id, cooldownTime);

        await saveData();
        blameCounts.set(id, userObj.blameCount);

        await interaction.reply(`${name} has been blamed ${userObj.servers[serverId].blameCount} times.`);

    } else if (command === 'top') {
        const count = 5;
        const serverId = interaction.guildId;
    
        const users = Object.values(data)
            .filter(user => {
                console.log(`Checking user ${user.name} (${user.id})`);
                console.log(`Blames: ${JSON.stringify(user.blames)}`);
                console.log(`Server data: ${JSON.stringify(user.servers[serverId])}`);
                const meetsConditions = user.blames[serenaId] !== undefined && user.blames[serenaId] > 0 && user.servers[serverId];
                console.log(`Meets conditions: ${meetsConditions}`);
                return meetsConditions;
            });
    
        console.log(`Filtered users: ${JSON.stringify(users)}`);
    
        const sortedUsers = users.sort((a, b) => b.blames[serenaId] - a.blames[serenaId]);
        console.log(`sortedUsers: ${JSON.stringify(sortedUsers)}`);
    
        const topUsers = sortedUsers.slice(0, count);
        console.log(`topUsers: ${JSON.stringify(topUsers)}`);
    
        const response = topUsers.map((user, index) => `${index + 1}. ${user.name} - ${user.blames[serenaId]}`).join('\n');
    
        const embed = {
            color: 0xff0000,
            title: `Top ${count} people who have blamed Serena the most:`,
            description: response,
        };
    
        await interaction.reply({
            embeds: [embed]
        });   

    } else if (command === 'setname') {
        // Check that the user is the guild owner
        if (interaction.member.id !== interaction.guild.ownerId) {
            await interaction.reply({
                content: 'Only the server owner can use this command.',
                ephemeral: true
            });
            return;
        }

        // Get the desired bot name from the command options
        const newName = interaction.options.getString('name', true);

        // Update the guild's bot nickname
        try {
            await interaction.guild.members.me.setNickname(newName);
            await interaction.reply({
                content: `Bot name updated to "${newName}"`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'An error occurred while updating the bot name. Please try again later.',
                ephemeral: true
            });
        }

    } else if (command === 'setavatar') {
        // Check that the user is the guild owner
        if (interaction.member.id !== interaction.guild.ownerId) {
            await interaction.reply({
                content: 'Only the server owner can use this command.',
                ephemeral: true
            });
            return;
        }

        // Get the URL of the desired avatar image from the command options
        const avatarUrl = interaction.options.getString('url', true);

        // Update the bot's avatar
        try {
            await client.user.setAvatar(avatarUrl);
            await interaction.reply({
                content: 'Bot avatar updated successfully!',
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'An error occurred while updating the bot avatar. Please try again later.',
                ephemeral: true
            });
        }
    } else if (command === 'populate') {
        const serverId = interaction.guild.id;
        Object.values(data).forEach(userObj => {
            userObj.servers = userObj.servers || {};
            userObj.servers[serverId] = userObj.servers[serverId] || {
                blameCount: 0,
                blames: {}
            };
        });
        await saveData();
        await interaction.reply('Server IDs populated successfully!');
    } else if (command === 'updateraidtime') {
        const month = args.getString('month', true);
        const day = args.getInteger('day', true);
        const year = args.getInteger('year', true);
        const time = args.getString('time', true);
        const timezone = args.getString('timezone', true);
        const nextRaid = args.getString('next_raid', true);
        const channelName = args.getChannel('channel_name', true);

        if (!channelName || channelName.type !== 'GUILD_TEXT') {
            await interaction.reply({
                content: 'You need to specify a valid text channel.',
                ephemeral: true
            });
            return;
        }

        if (interaction.member.id !== interaction.guild.ownerId) {
            console.log('User is not the server owner');
            await interaction.reply({
                content: 'You must be the server owner to use this command.',
                ephemeral: true
            });
            return;
        }

        const maxDays = moment(`${year}-${month}`, 'YYYY-M').daysInMonth();
        if (day > maxDays) {
            await interaction.reply({
                content: 'The selected month does not have that many days. Please choose a valid day.',
                ephemeral: true
            });
            return;
        }

        const timestamp = moment.tz(`${year}-${month}-${day} ${time}:00`, 'YYYY-M-D HH:mm:ss', timezone).unix();

        try {
            await channelName.setTopic(`Next meet is <t:${timestamp}:f> ${nextRaid}`);
            await interaction.reply({
                content: 'Raid time updated successfully!',
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'An error occurred while updating the raid time. Please try again later.',
                ephemeral: true
            });
        }
    }

});

client.login(config.token);
