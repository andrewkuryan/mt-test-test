import Router from '../Router';

const router = new Router();

router.botCommand('/echo', (chatId, update, bot) => {
  return bot.sendMessage(chatId, update.message?.text?.replace('/echo', '') ?? 'Echo');
});

export default router;
