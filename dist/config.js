"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const config = {
    token: zod_1.z.string().min(1).parse(process.env.DISCORD_BOT_TOKEN),
    clientId: zod_1.z.string().min(1).parse(process.env.DISCORD_CLIENT_ID),
    guildId: zod_1.z.string().min(1).parse(process.env.DISCORD_GUILD_ID),
    mongoUri: zod_1.z.string().min(1).parse(process.env.MONGO_URI),
};
exports.default = config;
