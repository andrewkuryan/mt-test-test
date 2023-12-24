import TelegramBot from 'node-telegram-bot-api';

import { CommandHandler } from './Command';

const echo: CommandHandler = async (update: TelegramBot.Update) => {
  const text = update.message?.text;
  return { text: text?.replace('/echo', '') ?? 'Echo' };
};

export default {
  name: 'echo',
  handler: echo,
};
