import discord, { SlashCommandBuilder } from 'discord.js';
import { addReminder } from '../lib/db';
export const data = new SlashCommandBuilder()
  .setName('remindme')
  .setDescription('Replies with Pong!')
  .addStringOption((option) =>
    option
      .setName('dateandtime')
      .setDescription(
        'Type the date and time you want to be reminded format: DD/MM/YYYY HH:MM:SS',
      )
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName('until')
      .setDescription(
        'Type how long until you want to be reminded format: 1d 2h 3m 4s',
      )
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName('message')
      .setDescription('Type the message you want to be reminded with')
      .setRequired(false),
  );

export async function execute(interaction: discord.CommandInteraction) {
  const message = interaction.options.get('message')?.value;
  const date = interaction.options.get('dateandtime')?.value;
  const until = interaction.options.get('until')?.value;
  let finalDate: Date | null = null;
  await interaction.reply('Setting up reminder...');
  if (date && typeof date === 'string') {
    const dateArray = date.split(' ');
    const [day, month, year] = dateArray[0].split('/');
    const [hour, minute, second] = dateArray[1].split(':');
    const dateObject = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second),
    );
    const now = new Date();
    finalDate = new Date(now.getTime() + dateObject.getTime() - now.getTime());
  }
  if (until && typeof until === 'string') {
    const time = until.split(' ');
    let dateObject = new Date();
    for (let i = 0; i < time.length; i++) {
      const value = parseInt(time[i].substring(0, time[i].length - 1));
      const unit = time[i].substring(time[i].length - 1);
      switch (unit.toLowerCase()) {
        case 'd':
        case 'day':
        case 'days':
          dateObject.setDate(dateObject.getDate() + value);
          break;
        case 'h':
        case 'hour':
        case 'hours':
          dateObject.setHours(dateObject.getHours() + value);
          break;
        case 'm':
        case 'minute':
        case 'minutes':
          dateObject.setMinutes(dateObject.getMinutes() + value);
          break;
        case 's':
        case 'second':
        case 'seconds':
          dateObject.setSeconds(dateObject.getSeconds() + value);
          break;
        default:
          await interaction.reply('Invalid time unit.');
          return;
      }
    }
    const now = new Date();
    finalDate = new Date(now.getTime() + dateObject.getTime() - now.getTime());
  }
  if (finalDate) {
    const msg = typeof message === 'string' ? message : 'Reminder';
    const time = finalDate.getTime() - new Date().getTime();
    if (time < 0) {
      return await interaction.followUp(
        'Please enter a date and time in the future.',
      );
    }
    await addReminder(
      interaction.user.id,
      interaction.channelId,
      msg,
      finalDate,
    );
    return await interaction.followUp(
      `I will remind you in ${time / 1000} seconds.`,
    );
  }
  return await interaction.followUp('Please enter a valid date and time.');
}

export default { data, execute };
