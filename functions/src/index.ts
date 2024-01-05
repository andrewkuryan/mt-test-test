import { onRequest } from 'firebase-functions/v2/https';
import Bot from 'node-telegram-bot-api';
import TelegramBot from 'node-telegram-bot-api';

import router from './commands';

if (process.env['MODE'] === 'PRIVATE') {
  const privateRouter = require('./private-commands').default;
  router.use(privateRouter);
}

const bot = process.env['TOKEN'] ? new Bot(process.env['TOKEN']) : null;

export const handler = onRequest(
  { timeoutSeconds: 30, maxInstances: 10 },
  async (request, response) => {
    if (bot && request.method === 'POST') {
      const update = request.body as TelegramBot.Update;

      await router.apply(update, bot);

      response.status(200);
      response.end();
    }
    if (request.method === 'GET') {
      response.status(200);
      response.send('OK');
    }
  },
);
