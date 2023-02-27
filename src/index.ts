import discord, {
  Events,
  GatewayIntentBits,
  Collection,
  Client,
  Command,
  SlashCommandBuilder,
  REST,
  Routes,
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import config from './config';
import { deleteReminder, getReminders } from './lib/db';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user?.tag}`);
});

client.login(config.token);

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath) as Command;
  if (!('name' in command.data) || !('description' in command.data)) {
    console.error(`Command ${file} is missing name or description`);
    continue;
  }
  if (!('execute' in command)) {
    console.error(`Command ${file} is missing execute`);
    continue;
  }
  client.commands.set(command.data.name, command);
  console.log(`Loaded command ${command.data.name}`);
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) handleChatInputCommand(interaction);
  if (interaction.isAutocomplete()) handleAutocomplete(interaction);
});

const handleChatInputCommand = async (
  interaction: discord.CommandInteraction,
) => {
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  }
};

const handleAutocomplete = async (
  interaction: discord.AutocompleteInteraction,
) => {
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  if (!('autocomplete' in command)) {
    console.error(`Command ${interaction.commandName} is missing autocomplete`);
    return;
  }

  try {
    await command.autocomplete(interaction);
  } catch (error) {
    console.error(error);
  }
};

setInterval(async () => {
  const reminders = await getReminders();
  for (const reminder of reminders) {
    const now = new Date();
    if (reminder.date.getTime() < now.getTime()) {
      const userId = reminder.userId;
      const channelId = reminder.channelID;
      const reminderId = reminder._id;
      await deleteReminder(reminderId);
      const channel = client.channels.cache.get(channelId);
      if (channel && 'send' in channel) {
        channel.send(`<@${userId}> ${reminder.reminder}`);
      }
    }
  }
}, 1000);
