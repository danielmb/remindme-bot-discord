import discord, { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');

export async function execute(interaction: discord.CommandInteraction) {
  await interaction.reply('Pong!');
}

export default { data, execute };
