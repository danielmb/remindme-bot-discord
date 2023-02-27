import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();

const config = {
  token: z.string().min(1).parse(process.env.DISCORD_BOT_TOKEN),
  clientId: z.string().min(1).parse(process.env.DISCORD_CLIENT_ID),
  guildId: z.string().min(1).parse(process.env.DISCORD_GUILD_ID),
  mongoUri: z.string().min(1).parse(process.env.MONGO_URI),
};

export default config;
