import TelegramBot from 'node-telegram-bot-api';

export interface CommandHandlerResult {
  text: string;
  options?: TelegramBot.SendMessageOptions;
}

export type CommandHandler = (update: TelegramBot.Update) => Promise<CommandHandlerResult>;

export interface Command {
  name: string;
  handler: CommandHandler;
}
