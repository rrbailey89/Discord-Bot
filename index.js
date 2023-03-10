// Import required modules
import fetch from "node-fetch";

// Import Discord.js and constructors to create a client
import {
  Client,
  EmbedBuilder
} from "discord.js";

// Import the configuration from a seperate file
import config from './config.js';

// Create the client and set the intents (permissions)
const client = new Client({
  intents: 3276799
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
                        if (user.bot) return; // skip bots vote
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
  }
  if (interaction.commandName === "xiv") {
    const typeOption = interaction.options.get("type");
    const nameOption = interaction.options.get("name");
    var type = typeOption.value;
    var name = nameOption.value;

    console.log(`type: ${type}`);
    console.log(`name: ${name}`);

    const apiKey = config.xivApiKey;
    var url;
    if (type === "character") {
      const serverOption = interaction.options.get("server");
      const server = serverOption.value;
      name = name.replace(/ /g, "+"); // Replace spaces with + signs
      url = `https://xivapi.com/character/search?name=${name}&server=${server}&private_key=${apiKey}`;
    } else {
      url = `https://xivapi.com/search?indexes=${type}&string=${name}&private_key=${apiKey}`;
    }

    console.log(`Fetching data from ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    console.log(`Received data: ${JSON.stringify(data)}`);

    if (data.Results.length > 0) {
        const result = data.Results[0];
        const iconUrl = `https://xivapi.com${result.Icon}`;
        const embed = new EmbedBuilder()
        .setTitle(result.Name)
        .setURL(`https://xivapi.com/${type}/${result.ID}`)
        .addFields(
            { name: 'Description', value: result.Description || "None"},
            )
        .setImage(iconUrl);
    
    if (type === "character") {
      // Add additional fields for character info
      const character = data.Character
      const server = character.Server;
      const portraitUrl = `https://xivapi.com${character.Portrait}`;

      embed.addFields(
        { name: 'Server', value: `${server}` },
        { name: 'Portrait', value: `${portraitUrl}` },
        { name: 'Race', value: `${character.Race.Name}` },
        { name: 'Gender', value: `${character.Gender}` },
        { name: 'Nameday', value: `${character.Nameday}` },
        { name: 'Guardian', value: `${character.GuardianDeity.Name}` },
        { name: 'Grand Company', value: `${character.FreeCompanyName}` }
      )

    } else {
      // Add additional fields for item info
      const itemLevel = result.ItemLevel;
      const itemCategory = result.ItemCategory.Name;
      const itemRarity = result.Rarity;
      const itemDescription = result.Description;
      
      embed.addFields(
        { name: 'Item Level', value: `${itemLevel}` },
        { name: 'Item Category', value: `${itemCategory}` },
        { name: 'Item Rarity', value: `${itemRarity}` },
        { name: 'Description', value: `${itemDescription}` }
      )      
    }
        console.log(`Sending embed: ${JSON.stringify(embed)}`);
        
        await interaction.reply({ embeds: [embed] });
    } else {
        await interaction.reply(`No ${type} found with name ${name}`);
    }
  }
});

client.login(config.token);
console.log(`Starting bot...`);
