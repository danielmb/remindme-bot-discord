import discord, { Command, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import config from '../config';

const commands: discord.RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

const commandsPath = path.join(__dirname, '..', 'commands');
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
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.token);
(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    const data = rest.put(Routes.applicationCommands(config.clientId), {
      body: commands,
    });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
