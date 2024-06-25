import TelegramBot, { MessageEntity } from 'node-telegram-bot-api';

type Handler = (
  chatId: number,
  update: TelegramBot.Update,
  bot: TelegramBot,
  context: Context,
) => any | Promise<any>;
type Command = {
  condition: (update: TelegramBot.Update) => boolean;
  handler: Handler;
};

type Validator = (
  update: TelegramBot.Update,
  context: Context,
) => string | null | Promise<string | null>;
type Guard = { validate: Validator };

type Context = {
  getExtra: <M extends Middleware<N, S>, N extends string = M['name'], S extends any = M['store']>(
    name: N,
  ) => S;
};
type Middleware<N extends string, S extends any> = {
  name: N;
  action: (update: TelegramBot.Update, context: Context) => any | Promise<any>;
  store?: S;
};

type CommandsBlock = Command | Guard | Middleware<string, any> | Array<CommandsBlock>;

function findCommandEntity(entities: MessageEntity[] | undefined): MessageEntity | undefined {
  return entities?.find(entity => entity.type === 'bot_command' || entity.type === 'text_link');
}

function getCommand(
  entity: MessageEntity | undefined,
  text: string | undefined,
): string | undefined {
  return entity ? text?.substr(entity.offset, entity.length) : undefined;
}

function getBotCommand(update: TelegramBot.Update) {
  const commandEntity =
    findCommandEntity(update.message?.entities) ??
    findCommandEntity(update.message?.caption_entities);
  return (
    getCommand(commandEntity, update.message?.text) ??
    getCommand(commandEntity, update.message?.caption)
  );
}

class Router implements Context {
  private commands: Array<CommandsBlock> = [];
  private middlewares: { [name: string]: Middleware<typeof name, any> } = {};

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

  middleware = <N extends string, S extends any>(middleware: Middleware<N, S>) => {
    this.middlewares = { ...this.middlewares, [middleware.name]: middleware };
    this.commands = [...this.commands, middleware];
  };

  getExtra = <N extends string, S extends any, M extends Middleware<N, S>>(name: N): S => {
    return this.middlewares[name].store;
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
          const validateResult = currentGuard ? await currentGuard.validate(update, this) : null;
          if (validateResult === null) {
            try {
              await command.handler(chatId, update, bot, this);
            } catch (err) {
              await bot.sendMessage(chatId, `${err}`);
            }
          } else {
            await bot.sendMessage(chatId, validateResult);
          }
        }
      } else if ('validate' in command) {
        currentGuard = command;
      } else if ('name' in command) {
        await command.action(update, this);
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
