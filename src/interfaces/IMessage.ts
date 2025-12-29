export interface IMessage {
  sender: string;
  content: string;
  room: string;
  timestamp?: Date;
}