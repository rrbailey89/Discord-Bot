const {
  Client,
  EmbedBuilder
} = require("discord.js");
const client = new Client({
  intents: 3276799
});
const config = require("./config.json");

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Listen for rate limit events
client.rest.on("rateLimited", (rateLimitedInfo) => {
  console.log(`Rate limited: ${JSON.stringify(rateLimitedInfo)}`);
});

client.on("interactionCreate", async(interaction) => {
  if (!interaction.isCommand()) {
      console.log(`Interaction received: not a command`);
      return;
  }

  if (interaction.commandName === "grantrole") {
      console.log(`Interaction received: grantrole command`);
      const roleOption = interaction.options.get("role");
      const userOption = interaction.options.get("user");
      const roleID = roleOption.value;
      const userID = userOption.value;

      const guild = interaction.guild;
      const member = await guild.members.fetch(userID);
      const role = guild.roles.cache.get(roleID);

      if (member.roles.cache.has(roleID)) {
          // If the member already has the role, remove it
          await member.roles.remove(role);
          console.log(`Removed ${role.name} role from <@${userID}>`);
          const reply = await interaction.reply(
`Removed ${role.name} role from <@${userID}>`);
          setTimeout(() => {
              interaction.deleteReply();
          }, 5000);
      } else {
          // If the member does not have the role, grant it
          await member.roles.add(role);
          console.log(`Added ${role.name} role to <@${userID}>`);
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

      console.log(`month: ${month}`);
      console.log(`day: ${day}`);
      console.log(`year: ${year}`);
      console.log(`time: ${time}`);
      console.log(`timezone: ${timezone}`);
      console.log(`raidName: ${raid}`);
      console.log(`channel: ${channel}`);
      console.log(`is_mine: ${is_mine}`);

      // Calculate Unix timestamp from inputs
      const formattedTime = `${time}:00 ${timezone}`;
      const dateString = `${day} ${month} ${year} ${formattedTime}`;
      const timestamp = Math.floor(Date.parse(dateString) / 1000);

      console.log(`timestamp: ${timestamp}`);

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
  } else {
      console.log(
`Interaction received: unknown command ${interaction.commandName}`);
  }
  if (interaction.commandName === "poll") {
      const question = interaction.options.getString("question");
      const options = [];
      for (let i = 1; i <= 10; i++) {
          const option = interaction.options.getString(`option${i}`);
          if (option)
              options.push(option);
      }

      if (options.length < 2) {
          await interaction.reply("You must provide at least 2 options");
          return;
      }

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

      const pollMessage = await interaction.reply({
          content: `Poll created by ${interaction.member.displayName}:`,
          embeds: [embed],
          fetchReply: true
      });

      for (let i = 0; i < options.length; i++) {
          await pollMessage.react(emojis[i]);
      }

      const duration = interaction.options.getInteger("duration");
      if (duration) {
          const durationInSeconds = Math.min(duration * 60, 30 * 60);
          const results = options.map((option) => ({
                      option,
                      count: 0,
                      voters: [],
                  }));

          setTimeout(async() => {
              const updatedMessage = await interaction.channel.messages.fetch(
                      pollMessage.id);

              const reactions = updatedMessage.reactions.cache;

              let totalVotes = 0;

              for (const reaction of reactions.values()) {
                if (reaction.partial) {
                    // If the reaction is partial, fetch the full reaction object
                    await reaction.fetch();
                }
                if (reaction.users.cache.has(client.user.id)) {
                    // If the bot is the one who reacted, ignore it
                    continue;
                }
                  const emjoiIndex = emojis.indexOf(reaction.emoji.name);
                  if (emjoiIndex >= 0) {
                      const {
                          count,
                          voters
                      } = results[emjoiIndex];
                      const reactionUsers = await reaction.users.fetch();
                      reactionUsers.forEach((user) => {
                          const member = interaction.guild.members.cache.get(user.id);
                          const voterName = member.nickname || user.username;
                          if (!voters.includes(voterName)) {
                              voters.push(voterName);
                          }
                      });
                      results[emjoiIndex].count = count + reaction.count - 1;
                      totalVotes += reaction.count - 1;
                  }
              }

              const totalText = `Total votes: ${totalVotes}`;
              const resultsText = results
                  .map(({
                          option,
                          count,
                          voters
                      }) => `${option}: ${count} votes (${voters.join(", ")}))`)
                  .join("\n\n");

              const updatedEmbed = new EmbedBuilder()
                  .setColor("#0099ff")
                  .setTitle("Poll Results")
                  .setDescription(`${totalText}\n\n${resultsText}`)
                  .setFooter({
                      text: `Poll created by ${interaction.member.displayName}`,
                  });

              await pollMessage.edit({
                  content: `Poll has ended:`,
                  embeds: [updatedEmbed],
              });
          }, durationInSeconds * 1000);
      }
  }
});

client.login(config.token);
console.log(`Starting bot...`);
