import TelegramBot from 'node-telegram-bot-api';

type Handler = (chatId: number, update: TelegramBot.Update, bot: TelegramBot) => any | Promise<any>;
type Command = {
  condition: (update: TelegramBot.Update) => boolean;
  handler: Handler;
};
type Validator = (update: TelegramBot.Update) => string | null | Promise<string | null>;
type Guard = { validate: Validator };
type CommandsBlock = Command | Guard | Array<CommandsBlock>;

function getBotCommand(update: TelegramBot.Update) {
  const commandEntity = update.message?.entities?.find(
    entity => entity.type === 'bot_command' || entity.type === 'text_link',
  );
  return commandEntity
    ? update.message?.text?.substr(commandEntity.offset, commandEntity.length)
    : undefined;
}

class Router {
  private commands: Array<CommandsBlock> = [];

  botCommand = (command: string, handler: Handler) => {
    this.commands = [
      ...this.commands,
      {
        condition: update => getBotCommand(update) === command,
        handler,
      },
    ];
  };

  handler = (condition: (update: TelegramBot.Update) => boolean, handler: Handler) => {
    this.commands = [...this.commands, { condition, handler }];
  };

  guard = (validator: Validator) => {
    this.commands = [...this.commands, { validate: validator }];
  };

  use = (router: Router) => {
    this.commands = [...this.commands, router.commands];
  };

  private handleCommandsList = async (
    list: Array<CommandsBlock>,
    guard: Guard | null,
    chatId: number,
    update: TelegramBot.Update,
    bot: TelegramBot,
  ) => {
    let currentGuard = guard;
    for (const command of list) {
      if ('condition' in command) {
        if (command.condition(update)) {
          const validateResult = currentGuard ? await currentGuard.validate(update) : null;
          if (validateResult === null) {
            try {
              await command.handler(chatId, update, bot);
            } catch (err) {
              await bot.sendMessage(chatId, `${err}`);
            }
          } else {
            await bot.sendMessage(chatId, validateResult);
          }
        }
      } else if ('validate' in command) {
        currentGuard = command;
      } else {
        await this.handleCommandsList(command, currentGuard, chatId, update, bot);
      }
    }
  };

  apply = async (update: TelegramBot.Update, bot: TelegramBot) => {
    const chatId = update.message?.chat.id;
    if (chatId) {
      await this.handleCommandsList(this.commands, null, chatId, update, bot);
    }
  };
}

export default Router;
