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
const config_1 = __importDefault(require("./config"));
const db_1 = require("./lib/db");
const client = new discord_js_1.Client({
    intents: [discord_js_1.GatewayIntentBits.Guilds],
});
client.once(discord_js_1.Events.ClientReady, (c) => {
    var _a;
    console.log(`Logged in as ${(_a = c.user) === null || _a === void 0 ? void 0 : _a.tag}`);
});
client.login(config_1.default.token);
client.commands = new discord_js_1.Collection();
const commandsPath = path_1.default.join(__dirname, 'commands');
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
    client.commands.set(command.data.name, command);
    console.log(`Loaded command ${command.data.name}`);
}
client.on(discord_js_1.Events.InteractionCreate, (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (interaction.isChatInputCommand())
        handleChatInputCommand(interaction);
    if (interaction.isAutocomplete())
        handleAutocomplete(interaction);
}));
const handleChatInputCommand = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }
    try {
        yield command.execute(interaction);
    }
    catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            yield interaction.followUp({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            });
        }
        else {
            yield interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            });
        }
    }
});
const handleAutocomplete = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield command.autocomplete(interaction);
    }
    catch (error) {
        console.error(error);
    }
});
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    const reminders = yield (0, db_1.getReminders)();
    console.log(reminders);
    for (const reminder of reminders) {
        const now = new Date();
        if (reminder.date.getTime() < now.getTime()) {
            const userId = reminder.userId;
            const channelId = reminder.channelID;
            const reminderId = reminder._id;
            console.log('Deleting reminder');
            yield (0, db_1.deleteReminder)(reminderId);
            console.log('Reminder deleted');
            console.log(reminder.date.getTime(), now.getTime());
            console.log(reminder.date.getTime() < now.getTime());
            const channel = client.channels.cache.get(channelId);
            console.log(channel);
            if (channel && 'send' in channel) {
                console.log('Sending reminder');
                channel.send(`<@${userId}> ${reminder.reminder}`);
            }
        }
    }
}), 1000);
