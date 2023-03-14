// Import the necessary packages and files
import {
  Client,
  EmbedBuilder,
  PermissionsBitField,
  GatewayIntentBits 
}
from "discord.js";
import config from './config.js';
import fs from "fs";

// Create the client and set the intents (permissions)

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],    
});

// When the bot is ready to start, log a message
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Listen for rate limit events adn log them
client.rest.on("rateLimited", (rateLimitedInfo) => {
  console.log(`Rate limited: ${JSON.stringify(rateLimitedInfo)}`);
});

// Listen for interactionCreate events
client.on("interactionCreate", async(interaction) => {
  if (!interaction.isCommand()) {
      // If the interaction is not a command, log it and return
      console.log(`Interaction received: not a command`);
      return;
  }

  if (interaction.commandName === "grantrole") {
      // If the command is grantrole, log it, get the role and user options and run the grantrole function
      console.log(`Interaction received: grantrole command`);
      const roleOption = interaction.options.get("role");
      const userOption = interaction.options.get("user");
      const roleID = roleOption.value;
      const userID = userOption.value;

      // Get the guild, member, and role objects from the interaction
      const guild = interaction.guild;
      const member = await guild.members.fetch(userID);
      const role = guild.roles.cache.get(roleID);

      if (member.roles.cache.has(roleID)) {
          // If the member already has the role, remove it and log a message
          await member.roles.remove(role);
          console.log(`Removed ${role.name} role from <@${userID}>`);
          // Reply to the interaction with a message and delete it after 5 seconds
          const reply = await interaction.reply(
`Removed ${role.name} role from <@${userID}>`);
          setTimeout(() => {
              interaction.deleteReply();
          }, 5000);
      } else {
          // If the member does not have the role, grant it and log a message
          await member.roles.add(role);
          console.log(`Added ${role.name} role to <@${userID}>`);
          // Reply to the interaction with a message and delete it after 5 seconds
          const reply = await interaction.reply(
`Added ${role.name} role to <@${userID}>`);
          setTimeout(() => {
              interaction.deleteReply();
          }, 5000);
      }
  } else if (interaction.commandName === "updateraidtime") {
      const month = interaction.options.getString("month");
      const day = interaction.options.getString("day");
      const year = interaction.options.getString("year");
      const time = interaction.options.getString("time");
      const timezone = interaction.options.getString("timezone");
      const raid = interaction.options.getString("raid");
      const is_mine = interaction.options.getBoolean("is_mine");
      const channel = interaction.options.getChannel("channel");

      // Calculate Unix timestamp from inputs
      const formattedTime = `${time}:00 ${timezone}`;
      const dateString = `${day} ${month} ${year} ${formattedTime}`;
      const timestamp = Math.floor(Date.parse(dateString) / 1000);

      // Append "M.I.N.E." to raid name if isMine is true
      const formattedRaid = is_mine ? `${raid} M.I.N.E.` : raid;

      // Update channel topic
      await channel.setTopic(
`Next Meet Is: ${formattedRaid} | Time: <t:${timestamp}:f>`);
      await interaction.reply(`Raid time updated for channel ${channel.name}!`);
  } else if (interaction.commandName === "setavatar") {
      console.log(`Interaction received: setavatar command`);
      const urlOption = interaction.options.get("url");
      const url = urlOption.value;

      // Set the bot's avatar
      await client.user.setAvatar(url);

      await interaction.reply(`Set the bot's avatar to ${url}`);

      // Delete the reply after 5 seconds
      const reply = await interaction.fetchReply();
      setTimeout(() => {
          reply.delete();
      }, 5000);

  } else if (interaction.commandName === "poll") {
      // Get the question and options from the user's input
      const question = interaction.options.getString("question");
      const options = [];
      for (let i = 1; i <= 10; i++) {
          const option = interaction.options.getString(`option${i}`);
          if (option)
              options.push(option);
      }
      // Make sure that there are at least two options
      if (options.length < 2) {
          await interaction.reply("You must provide at least 2 options");
          return;
      }
      // Create an array of emojis to use as reaction options
      const emojis = [
          "🇦",
          "🇧",
          "🇨",
          "🇩",
          "🇪",
          "🇫",
          "🇬",
          "🇭",
          "🇮",
          "🇯",
      ];
      // Create an embed to display the poll
      const embed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle(question)
          .setDescription(
              options
              .map((option, index) => `${emojis[index]} ${option}`)
              .join("\n\n"))
          .setFooter({
              text: `React with the corresponding emoji to vote`,
          });
      // Post the poll message and add reaction options
      const pollMessage = await interaction.reply({
          content: `Poll created by ${interaction.member.displayName}:`,
          embeds: [embed],
          fetchReply: true
      });

      for (let i = 0; i < options.length; i++) {
          await pollMessage.react(emojis[i]);
      }
      // If a duration was specified, set a timeout to end the poll
      const duration = interaction.options.getInteger("duration");
      if (duration) {
          // Calculate the duration in seconds, limiting it to a maximum of 30 minutes
          const durationInSeconds = Math.min(duration * 60, 30 * 60);
          // Initialize the poll results with zero votes for each option
          const results = options.map((option) => ({
                      option,
                      count: 0,
                      voters: [],
                  }));
          // Set a timeout to execute after the specified duration has elapsed
          setTimeout(async() => {
              // Retrieve the updated message to get the latest reaction counts
              const updatedMessage = await interaction.channel.messages.fetch(
                      pollMessage.id);
              // Retrieve the reactions on the poll message
              const reactions = updatedMessage.reactions.cache;

              let totalVotes = 0;
              // Iterate over each reaction to update the poll results
              for (const reaction of reactions.values()) {
                  const emjoiIndex = emojis.indexOf(reaction.emoji.name);
                  if (emjoiIndex >= 0) {
                      const {
                          count,
                          voters
                      } = results[emjoiIndex];
                      const reactionUsers = await reaction.users.fetch();
                      reactionUsers.forEach((user) => {
                          if (user.bot)
                              return; // skip bots vote
                          // Get the member object for the user and add their name to the list of voters
                          const member = interaction.guild.members.cache.get(user.id);
                          const voterName = member.nickname || user.username;
                          if (!voters.includes(voterName)) {
                              voters.push(voterName);
                          }
                      });
                      // Update the vote count for the option and add it to the total vote count
                      results[emjoiIndex].count = count + reaction.count - 1;
                      totalVotes += reaction.count - 1;
                  }
              }
              // Calculate the total number of votes across all options
              const totalText = `Total votes: ${totalVotes}`;
              // Generate a string displaying the vote count for each option, along with the names of the members who voted for it
              const resultsText = results
                  .map(({
                          option,
                          count,
                          voters
                      }) => {
                      if (count > 0) {
                          return `${option}: ${count} votes (${voters.join(", ")})`;
                      } else {
                          return `${option}: ${count} votes`;
                      }
                  })
                  .join("\n\n");
              // Create an embed to display the poll results
              const updatedEmbed = new EmbedBuilder()
                  .setColor("#0099ff")
                  .setTitle("Poll Results")
                  .setDescription(`${totalText}\n\n${resultsText}`)
                  .setFooter({
                      text: `Poll created by ${interaction.member.displayName}`,
                  });
              // Edit the poll message to display the results
              await pollMessage.edit({
                  content: `Poll has ended:`,
                  embeds: [updatedEmbed],
              });
              // Set a timeout to end the poll after the specified duration has elapsed
          }, durationInSeconds * 1000);
      }

  } else if (interaction.commandName === 'kick') {
      // Check if the user has permission to kick members
      if (!interaction.member.permissions.has([PermissionsBitField.Flags.KickMembers])) {
          await interaction.reply('You do not have permission to kick members.');
          return;
      }

      // Get the member to kick
      const member = interaction.options.getMember('member');

      // Check if the bot can kick the member
      if (!member.kickable) {
          await interaction.reply('The bot cannot kick this user.');
          return;
      }

      // Get the reason for kicking the member
      const reason = interaction.options.getString('reason');

      try {
          // Kick the member
          await member.kick(reason);

          // Log the kick in the server's audit log
          const logEmbed = new EmbedBuilder()
              .setTitle(`Member Kicked: ${member.displayName}`)
              .addFields({
                  name: 'Member',
                  value: `${member.toString()}`,
                  inline: true
              }, {
                  name: 'Moderator',
                  value: `${interaction.user.toString()}`,
                  inline: true
              }, {
                  name: 'Reason',
                  value: `${reason}`,
                  inline: true
              }, )
              .setColor('#ff0000')
              .setTimestamp();

          const auditlog = await interaction.guild.fetchAuditLogs({
              type: 20,
              limit: 1
          });

          const auditLogEntry = auditlog.entries.first();
          if (auditLogEntry) {
              logEmbed.setFooter({
                  text: `Kicked by ${auditLogEntry.executor.tag}`,
                  iconURL: auditLogEntry.executor.avatarURL({
                      dynamic: true
                  })
              });
          }

          const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'audit-log');
          if (logChannel) {
              await logChannel.send({
                  embeds: [logEmbed]
              });
          }

          await interaction.reply(`${member.user.tag} has been kicked.`);
      } catch (error) {
          console.error(error);
          await interaction.reply('There was an error trying to kick the member.');
      }

  } else if (interaction.commandName === 'timeout') {
      // Check if the user has permission to moderate members
      if (!interaction.member.permissions.has([PermissionsBitField.Flags.ModerateMembers])) {
          await interaction.reply('You do not have permission to moderate members.');
          return;
      }

      // Get the duration of the timeout in minutes
    const durationInMinutes = parseInt(interaction.options.getInteger('duration'));

      // Get the member to timeout
    const member = interaction.options.getMember('user');

      // Get the reason for the timeout
    const reason = interaction.options.getString('reason');

      // Check if the bot can timeout the member
      if (!member.moderatable) {
          await interaction.reply('The bot cannot timeout this user.');
          return;
      }

      // Convert the duration to milliseconds
      const durationInMilliseconds = durationInMinutes * 60 * 1000;
      console.log(`durationInMilliseconds: ${durationInMilliseconds}`);
      
      try {
          // Timeout the member
          await member.timeout(durationInMilliseconds, reason);

          // Log the timeout in the server's audit log
          const timeoutEmbed = new EmbedBuilder()
              .setTitle(`Member Timed Out: ${member.displayName}`)
              .addFields({
                  name: 'Member',
                  value: `${member.toString()}`,
                  inline: true
              }, {
                  name: 'Moderator',
                  value: `${interaction.user.toString()}`,
                  inline: true
              }, {
                  name: 'Duration',
                  value: `${durationInMinutes} minutes`,
                  inline: true
              }, )
              .setColor('#ff0000')
              .setTimestamp();

          const timeoutauditlog = await interaction.guild.fetchAuditLogs({
              type: 24,
              limit: 1,
          });
          const timeoutauditLogEntry = timeoutauditlog.entries.first();
          if (timeoutauditLogEntry) {
              timeoutEmbed.setFooter({
                  text: `Timed out by ${timeoutauditLogEntry.executor.tag}`,
                  iconURL: timeoutauditLogEntry.executor.avatarURL({
                      dynamic: true
                  })
              });
          }
          const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'audit-log');
          if (logChannel) {
              await logChannel.send({
                  embeds: [timeoutEmbed]
              });
          }
          await interaction.reply(`${member.user.tag} has been timed out`);
      } catch (error) {
          console.error(error);
          await interaction.reply('There was an error trying to timeout the member.');
      }
  
  } else if (interaction.isContextMenuCommand()) {
    if (interaction.commandName === "User Information") {
      const member = interaction.targetMember;
      const roles = member.roles.cache.filter(role => role.name !== '@everyone');
      const rolesValue = roles.size ? roles.map(role => role.toString()).join(" ") : 'No Roles Assigned';
      const embed = new EmbedBuilder()
        .setTitle(`User Info - ${member.displayName}`)
        .setImage(member.user.avatarURL({ dynamic: true, size: 4096 }))
        .addFields({
            name: 'Discord Name',
            value: `${member.user.tag}`,
            inline: true
        }, {
            name: 'Nickname',
            value: `${member.displayName}`,
            inline: true
        }, {
            name: 'Account Created On',
            value: `${member.user.createdAt.toLocaleString()}`,
            inline: true       
         }, {
            name: 'Joined Server On',
            value: `${member.joinedAt.toLocaleString()}`,
            inline: true
         }, {
            name: 'Roles',
            value: `${rolesValue}`,
            inline: true
        } )
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });

    } else if (interaction.commandName === 'rules') {
        if (interaction.options.getSubcommand() === 'add') {
            // Check if the user has permission to add rules
            if (!interaction.member.permissions.has([PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.Administrator])) {
                await interaction.reply('You do not have permission to add rules.');
                return;
            }
    
            // Get the rule to add
            const rule = interaction.options.getString('rule');
    
            try {
                // Add the rule to the file
                fs.appendFileSync('./rules.txt', `${rule}\n`);
                await interaction.reply(`Rule added: ${rule}`);
            } catch (error) {
                console.error(error);
                await interaction.reply('There was an error trying to add the rule.');
            }
        } else if (interaction.options.getSubcommand() === 'populate') {
            // Check if the user has permission to add rules
            if (!interaction.member.permissions.has([PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.Administrator])) {
                await interaction.reply('You do not have permission to use the rules commands.');
                return;
            }
    
            // Get the channel to send the rules message to
            const channel = interaction.options.getChannel('channel');
    
            // Get the rules from the file
            const rules = fs.readFileSync('./rules.txt', 'utf8').split('\n');
    
            // Create the rules embed
            const rulesEmbed = new EmbedBuilder()
                .setTitle('Server Rules')
                .setColor('#0099ff')
                .setDescription(rules.join('\n'));
    
            // Send the rules embed to the channel
            await channel.send({ embeds: [rulesEmbed] });
    
            await interaction.reply(`Rules populated in ${channel.toString()}`);
        } else if (interaction.options.getSubcommand() === 'repopulate') {
            // Check if the user has permission to send messages
            if (!interaction.member.permissions.has([PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.Administrator])) {
                await interaction.reply('You do not have permission to use the rules commands.');
                return;
            }
    
            // Get the channel to repopulate the rules message in
            const channel = interaction.options.getChannel('channel');
    
            // Find the previous rules message sent by the bot in the specified channel
            const messages = await channel.messages.fetch({ limit: 100 });
            const botMessages = messages.filter(m => m.author.id === client.user.id && m.embeds.length > 0 && m.embeds[0].title === 'Server Rules');
            const previousMessage = botMessages.first();
    
            // Get the updated rules from the file
            const rules = fs.readFileSync('./rules.txt', 'utf8').split('\n');
    
            // Create an embed with the updated rules
            const rulesEmbed = new EmbedBuilder()
                .setTitle('Server Rules')
                .setColor('#0099ff')
                .setDescription(rules.join('\n'));
    
            try {
                // Update the previous rules message with the updated rules
                await previousMessage.edit({ embeds: [rulesEmbed] });
            
                await interaction.reply(`Rules repopulated in ${channel.toString()}`);
            } catch (error) {
                console.error(error);
                await interaction.reply('There was an error trying to repopulate the rules.');
            }
        }
    }
    }});

client.login(config.token);
console.log(`Starting bot...`);
