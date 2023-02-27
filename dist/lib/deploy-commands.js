"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config"));
const commands = [];
const commandsPath = path_1.default.join(__dirname, '..', 'commands');
const commandFiles = fs_1.default
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path_1.default.join(commandsPath, file);
    const command = require(filePath);
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
const rest = new discord_js_1.REST({ version: '10' }).setToken(config_1.default.token);
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Started refreshing application (/) commands.');
        const data = rest.put(discord_js_1.Routes.applicationCommands(config_1.default.clientId), {
            body: commands,
        });
        console.log('Successfully reloaded application (/) commands.');
    }
    catch (error) {
        console.error(error);
    }
}))();
