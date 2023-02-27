import { Db, MongoClient } from 'mongodb';
import type { Document } from 'mongodb';
import config from '../config';

interface Reminder {
  userId: string;
  reminder: string;
  channelID: string;
  date: Date;
}
type ReminderDocument = Reminder & Document;

let cachedClient: MongoClient;
let cachedDb: Db;
const connect = async () => {
  if (cachedClient) {
    return { client: cachedClient, db: cachedDb };
  }
  const client = await MongoClient.connect(config.mongoUri);
  const db = client.db('reminders');
  cachedClient = client;
  cachedDb = db;
  return { client, db };
};

export const addReminder = async (
  userId: Reminder['userId'],
  channelID: Reminder['channelID'],
  reminder: Reminder['reminder'],
  date: Reminder['date'],
) => {
  const { db } = await connect();
  const collection = db.collection<ReminderDocument>('reminders');
  const result = await collection.insertOne({
    userId,
    reminder,
    date,
    channelID,
  });
  return result;
};

export const getReminders = async (
  userId?: Reminder['userId'],
): Promise<ReminderDocument[]> => {
  const { db } = await connect();
  const collection = db.collection<ReminderDocument>('reminders');
  let result: ReminderDocument[];
  if (userId) {
    result = await collection.find({ userId }).toArray();
  } else {
    result = await collection.find().toArray();
  }
  return result;
};

export const deleteReminder = async (reminderId: ReminderDocument['_id']) => {
  const { db } = await connect();
  const collection = db.collection<ReminderDocument>('reminders');
  const result = await collection.deleteOne({ _id: reminderId });
  return result;
};

export default connect;
