import { ActivityType, Events } from 'discord.js';
export default {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		await client.user.setPresence({
			activities: [{
				name: 'Everything You Type',
				type: ActivityType.Watching,
			}],
			status: 'online',
		});
	},
};