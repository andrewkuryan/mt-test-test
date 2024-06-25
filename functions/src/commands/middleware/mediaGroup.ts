import TelegramBot from 'node-telegram-bot-api';

export const MEDIA_GROUP_MIDDLEWARE_NAME = 'MEDIA_GROUP_MIDDLEWARE';

export class MediaGroupMiddleware {
  name: string = MEDIA_GROUP_MIDDLEWARE_NAME;

  action = (update: TelegramBot.Update) => {
    if (this.store && update.message?.media_group_id == this.store.id) {
      this.store = { ...this.store, updates: [...this.store.updates, update] };
    } else if (update.message?.media_group_id) {
      this.store = { id: update.message.media_group_id, updates: [update] };
    }
  };

  store: { id: string; updates: TelegramBot.Update[] } | undefined = undefined;
}

export default new MediaGroupMiddleware();
