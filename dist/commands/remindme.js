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
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const db_1 = require("../lib/db");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('remindme')
    .setDescription('Replies with Pong!')
    .addStringOption((option) => option
    .setName('dateandtime')
    .setDescription('Type the date and time you want to be reminded format: DD/MM/YYYY HH:MM:SS')
    .setRequired(false))
    .addStringOption((option) => option
    .setName('until')
    .setDescription('Type how long until you want to be reminded format: 1d 2h 3m 4s')
    .setRequired(false))
    .addStringOption((option) => option
    .setName('message')
    .setDescription('Type the message you want to be reminded with')
    .setRequired(false));
function execute(interaction) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const message = (_a = interaction.options.get('message')) === null || _a === void 0 ? void 0 : _a.value;
        const date = (_b = interaction.options.get('dateandtime')) === null || _b === void 0 ? void 0 : _b.value;
        const until = (_c = interaction.options.get('until')) === null || _c === void 0 ? void 0 : _c.value;
        console.log('Executing remindme command');
        let finalDate = null;
        yield interaction.reply('Setting up reminder...');
        if (date && typeof date === 'string') {
            const dateArray = date.split(' ');
            const [day, month, year] = dateArray[0].split('/');
            const [hour, minute, second] = dateArray[1].split(':');
            const dateObject = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
            console.log(dateObject);
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
                        yield interaction.reply('Invalid time unit.');
                        return;
                }
            }
            const now = new Date();
            finalDate = new Date(now.getTime() + dateObject.getTime() - now.getTime());
        }
        console.log(finalDate);
        if (finalDate) {
            const msg = typeof message === 'string' ? message : 'Reminder';
            const time = finalDate.getTime() - new Date().getTime();
            if (time < 0) {
                return yield interaction.followUp('Please enter a date and time in the future.');
            }
            yield (0, db_1.addReminder)(interaction.user.id, interaction.channelId, msg, finalDate);
            return yield interaction.followUp(`I will remind you in ${time / 1000} seconds.`);
        }
        return yield interaction.followUp('Please enter a valid date and time.');
    });
}
exports.execute = execute;
exports.default = { data: exports.data, execute };
