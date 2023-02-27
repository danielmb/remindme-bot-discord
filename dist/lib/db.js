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
exports.deleteReminder = exports.getReminders = exports.addReminder = void 0;
const mongodb_1 = require("mongodb");
const config_1 = __importDefault(require("../config"));
let cachedClient;
let cachedDb;
const connect = () => __awaiter(void 0, void 0, void 0, function* () {
    if (cachedClient) {
        return { client: cachedClient, db: cachedDb };
    }
    const client = yield mongodb_1.MongoClient.connect(config_1.default.mongoUri);
    const db = client.db('reminders');
    cachedClient = client;
    cachedDb = db;
    return { client, db };
});
const addReminder = (userId, channelID, reminder, date) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = yield connect();
    const collection = db.collection('reminders');
    const result = yield collection.insertOne({
        userId,
        reminder,
        date,
        channelID,
    });
    return result;
});
exports.addReminder = addReminder;
const getReminders = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = yield connect();
    const collection = db.collection('reminders');
    let result;
    if (userId) {
        result = yield collection.find({ userId }).toArray();
    }
    else {
        result = yield collection.find().toArray();
    }
    return result;
});
exports.getReminders = getReminders;
const deleteReminder = (reminderId) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = yield connect();
    const collection = db.collection('reminders');
    const result = yield collection.deleteOne({ _id: reminderId });
    return result;
});
exports.deleteReminder = deleteReminder;
exports.default = connect;
