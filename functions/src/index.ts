import { onRequest } from 'firebase-functions/v2/https';
import Bot from 'node-telegram-bot-api';
import TelegramBot from 'node-telegram-bot-api';

import commands from './commands';

const bot = process.env['TOKEN'] ? new Bot(process.env['TOKEN']) : null;

export const handler = onRequest(
  { timeoutSeconds: 30, maxInstances: 10 },
  async (request, response) => {
    if (request.method === 'POST') {
      const update = request.body as TelegramBot.Update;
      const chatId = update.message?.chat.id;
      if (chatId) {
        const commandEntity = update.message?.entities?.find(
          entity => entity.type === 'bot_command' || entity.type === 'text_link',
        );
        const botCommand = commandEntity
          ? update.message?.text?.substr(commandEntity.offset + 1, commandEntity.length - 1)
          : null;
        const command = commands.find(cmd => cmd.name === botCommand);
        if (command) {
          const result = await command.handler(update);
          await bot?.sendMessage(chatId, result.text, result.options);
        } else if (botCommand) {
          await bot?.sendMessage(chatId, 'Unsupported command');
        }
      }
      response.status(200);
      response.end();
    }
    if (request.method === 'GET') {
      response.status(200);
      response.send('OK');
    }
  },
);
