import { SlashCommandBuilder } from 'discord.js';

const command = {
	data: new SlashCommandBuilder()
		.setName('updateraidtime')
		.setDescription('Updates the raid time for the next raid')
		.addStringOption(option =>
			option
				.setName('month')
				.setDescription('The month of the next raid')
				.setRequired(true)
				.addChoices(
					{ name: 'January', value: 'January' },
					{ name: 'February', value: 'February' },
					{ name: 'March', value: 'March' },
					{ name: 'April', value: 'April' },
					{ name: 'May', value: 'May' },
					{ name: 'June', value: 'June' },
					{ name: 'July', value: 'July' },
					{ name: 'August', value: 'August' },
					{ name: 'September', value: 'September' },
					{ name: 'October', value: 'October' },
					{ name: 'November', value: 'November' },
					{ name: 'December', value: 'December' },
				))
		.addIntegerOption(option =>
			option
				.setName('day')
				.setDescription('The day of the next raid')
				.setRequired(true),
		)
		.addStringOption(option =>
			option
				.setName('year')
				.setDescription('The year of the next raid')
				.setRequired(true)
				.addChoices(
					{ name: '2021', value: '2021' },
					{ name: '2022', value: '2022' },
					{ name: '2023', value: '2023' },
					{ name: '2024', value: '2024' },
					{ name: '2025', value: '2025' },
					{ name: '2026', value: '2026' },
					{ name: '2027', value: '2027' },
					{ name: '2028', value: '2028' },
					{ name: '2029', value: '2029' },
					{ name: '2030', value: '2030' },
				))
		.addStringOption(option =>
			option
				.setName('time')
				.setDescription('The time of the next raid')
				.setRequired(true)
				.addChoices(
					{ name:	'01:00', value: '01:00' },
					{ name: '02:00', value: '02:00' },
					{ name: '03:00', value: '03:00' },
					{ name: '04:00', value: '04:00' },
					{ name: '05:00', value: '05:00' },
					{ name: '06:00', value: '06:00' },
					{ name: '07:00', value: '07:00' },
					{ name: '08:00', value: '08:00' },
					{ name: '09:00', value: '09:00' },
					{ name: '10:00', value: '10:00' },
					{ name: '11:00', value: '11:00' },
					{ name: '12:00', value: '12:00' },
					{ name: '13:00', value: '13:00' },
					{ name: '14:00', value: '14:00' },
					{ name: '15:00', value: '15:00' },
					{ name: '16:00', value: '16:00' },
					{ name: '17:00', value: '17:00' },
					{ name: '18:00', value: '18:00' },
					{ name: '19:00', value: '19:00' },
					{ name: '20:00', value: '20:00' },
					{ name: '21:00', value: '21:00' },
					{ name: '22:00', value: '22:00' },
					{ name: '23:00', value: '23:00' },
				))
		.addStringOption(option =>
			option
				.setName('timezone')
				.setDescription('The timezone of the next raid')
				.setRequired(true)
				.addChoices(
					{ name: 'Eastern Standard Time', value: 'GMT-0500' },
					{ name: 'Central Standard Time', value: 'GMT-0600' },
					{ name: 'Mountain Standard Time', value: 'GMT-0700' },
					{ name: 'Pacific Standard Time', value: 'GMT-0800' },
					{ name: 'Alaska Standard Time', value: 'GMT-0900' },
					{ name: 'Eastern Daylight Time', value: 'GMT-0400' },
					{ name: 'Central Daylight Time', value: 'GMT-0500' },
					{ name: 'Mountain Daylight Time', value: 'GMT-0600' },
					{ name: 'Pacific Daylight Time', value: 'GMT-0700' },
					{ name: 'Alaska Daylight Time', value: 'GMT-0800' },
					{ name: 'Hawaii Standard Time', value: 'GMT-1000' },
				))
		.addStringOption(option =>
			option
				.setName('raid')
				.setDescription('The raid instance of the next raid')
				.setRequired(true)
				.addChoices(
					{ name: 'Alexander - The Burden of the Son (Savage)', value: 'Alexander - The Burden of the Son (Savage)' },
					{ name: 'Alexander - The Eyes of the Creator (Savage)', value: 'Alexander - The Eyes of the Creator (Savage)' },
					{ name: 'Alexander - The Breath of the Creator (Savage)', value: 'Alexander - The Breath of the Creator (Savage)' },
					{ name: 'Alexander - The Heart of the Creator (Savage)', value: 'Alexander - The Heart of the Creator (Savage)' },
					{ name: 'Alexander - The Soul of the Creator (Savage)', value: 'Alexander - The Soul of the Creator (Savage)' },
				))
		.addChannelOption(option =>
			option
				.setName('channel')
				.setDescription('The channel to post the raid in')
				.setRequired(true),
		)
		.addBooleanOption(option =>
			option
				.setName('mine')
				.setDescription('Is this M.I.N.E. or not?')
				.setRequired(false),
		),

	async execute(interaction) {
		const month = interaction.options.getString('month');
		const day = interaction.options.getInteger('day');
		const year = interaction.options.getString('year');
		const time = interaction.options.getString('time');
		const timezone = interaction.options.getString('timezone');
		const raid = interaction.options.getString('raid');
		const mine = interaction.options.getBoolean('mine');
		const channel = interaction.options.getChannel('channel');

		// Calculate Unix timestamp from inputs
		const formattedTime = `${time}:00 ${timezone}`;
		const dateString = `${day} ${month} ${year} ${formattedTime}`;
		const timestamp = Math.floor(Date.parse(dateString) / 1000);

		// Append "M.I.N.E." to raid name if isMine is true
		const formattedRaid = mine ? `${raid} M.I.N.E.` : raid;

		// Update channel topic
		await channel.setTopic(
			`Next Meet Is: ${formattedRaid} | Time: <t:${timestamp}:f>`);
		await interaction.reply(`Raid time updated for channel ${channel.name}!`);
	},
};

export default command;