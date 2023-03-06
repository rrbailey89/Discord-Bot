const { Client } = require("discord.js");
const moment = require('moment-timezone');
const client = new Client({ intents: 3276799,});
const config = require("./config.json");

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Listen for rate limit events
client.rest.on("rateLimited", (rateLimitedInfo) => {
  console.log(`Rate limited: ${JSON.stringify(rateLimitedInfo)}`);
});

client.on("interactionCreate", async (interaction) => {
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
        `Removed ${role.name} role from <@${userID}>`
      );
      setTimeout(() => {
        interaction.deleteReply();
      }, 5000);
    } else {
      // If the member does not have the role, grant it
      await member.roles.add(role);
      console.log(`Added ${role.name} role to <@${userID}>`);
      const reply = await interaction.reply(
        `Added ${role.name} role to <@${userID}>`
      );
      setTimeout(() => {
        interaction.deleteReply();
      }, 5000);
    }
} else if (interaction.commandName === 'updateraidtime') {
  const month = interaction.options.getString('month');
  const day = interaction.options.getString('day');
  const year = interaction.options.getString('year');
  const time = interaction.options.getString('time');
  const timezone = interaction.options.getString('timezone');
  const raid = interaction.options.getString('raid');
  const channel = interaction.options.getChannel('channel');

  console.log(`month: ${month}`);
  console.log(`day: ${day}`);
  console.log(`year: ${year}`);
  console.log(`time: ${time}`);
  console.log(`timezone: ${timezone}`);
  console.log(`raidName: ${raid}`);
  console.log(`channel: ${channel}`);

  // Calculate Unix timestamp from inputs
  const formattedTime = `${time}:00 ${timezone}`;
  const dateString = `${day} ${month} ${year} ${formattedTime}`;
  const timestamp = Math.floor(Date.parse(dateString) / 1000);

  console.log(`timestamp: ${timestamp}`);

  // Update channel topic
  await channel.setTopic(`Upcoming raid: ${raid} | Time: <t:${timestamp}:F>`);
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
      `Interaction received: unknown command ${interaction.commandName}`
    );
  }
});

client.login(config.token);
console.log(`Starting bot...`);
