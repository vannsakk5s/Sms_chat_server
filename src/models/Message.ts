import mongoose, { Schema, Document } from 'mongoose';
import { IMessage } from '../interfaces/IMessage';

export interface IMessageDocument extends IMessage, Document {}

const MessageSchema: Schema = new Schema({
  sender: { type: String, required: true },
  content: { type: String, required: true },
  room: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model<IMessageDocument>('Message', MessageSchema);