// reactionCreate.js
import { Events } from 'discord.js';

export default {
	name: Events.MessageReactionAdd,
	execute(reaction, user) {
		// Get the message reactions channel
		const channel = reaction.client.channels.cache.get('1150994279376900207');

		// Send message to reactions channel
		channel.send(`${user.tag} reacted with ${reaction.emoji} to message: ${reaction.message.url}`);
	},
};