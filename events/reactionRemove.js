// reactionRemove.js
import { Events } from 'discord.js';

export default {
	name: Events.MessageReactionRemove,
	execute(reaction, user) {
		// Get the message reactions channel
		const channel = reaction.client.channels.cache.get('1150994279376900207');

		// Send message to reactions channel
		channel.send(`${user.tag} removed their ${reaction.emoji} reaction from message: ${reaction.message.url}`);
	},
};