import TelegramBot from 'node-telegram-bot-api';
import { Command, CommanderError, Option, Argument } from '@commander-js/extra-typings';
import consumers from 'stream/consumers';

import Router from '../../Router';
import { MEDIA_GROUP_MIDDLEWARE_NAME, MediaGroupMiddleware } from '../middleware/mediaGroup';
import { execCode } from './service';
import languages, { ExecFile } from './languages';

const router = new Router();

const defaultLang = 'js';

async function getCodeOutput(code: string[], args: string[], files: ExecFile[]) {
  let program = new Command();
  let programOutput = '';

  program
    .name('/exec')
    .addArgument(new Argument('<code>', 'source code fragment').argOptional())
    .exitOverride()
    .configureOutput({
      writeOut: (str: string) => {
        programOutput += str;
      },
      writeErr: (str: string) => {
        programOutput += str;
      },
    })
    .usage('[options]\n<code>');

  for (const [ext, lang] of Object.entries(languages)) {
    program = program.addOption(
      new Option(
        `--${ext}`,
        `execute code as ${lang.name}` + (ext === defaultLang ? ' (default)' : ''),
      ),
    );
  }

  try {
    const result = program.parse(args, { from: 'user' });

    if (!code) {
      throw new Error("missing required argument 'code'");
    }

    const options = result.opts();
    const lang =
      Object.entries(options)
        .filter(([name, _]) => languages[name])
        .find(([_, value]) => value)?.[0] ?? 'js';

    const response = await execCode({
      properties: languages[lang].buildOptions(code.join('\n'), files),
    });

    return response.stdout || response.stderr || 'Program did not output anything';
  } catch (err: unknown) {
    if (err instanceof CommanderError) {
      return programOutput;
    } else {
      return `${err}`;
    }
  }
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

async function getFiles(
  bot: TelegramBot,
  update: TelegramBot.Update,
  mediaGroup: TelegramBot.Update[],
): Promise<ExecFile[]> {
  const lastGroupUpdate = [...mediaGroup].sort(
    (u1, u2) => (u2.message?.message_id ?? 0) - (u1.message?.message_id ?? 0),
  )[0];
  const isGroupRecent =
    (lastGroupUpdate?.message?.message_id ?? 0) == (update.message?.message_id ?? 0) - 1;

  const documents = [
    update.message?.document,
    ...(isGroupRecent ? mediaGroup.map(it => it.message?.document) : []),
  ].filter(isDefined);

  const contents = await Promise.all(
    documents.map(file => bot.getFileStream(file.file_id)).map(steam => consumers.text(steam)),
  );

  return contents.map((content, index) => ({
    name: documents[index].file_name ?? documents[index].file_id,
    content,
  }));
}

router.botCommand('/exec', async (chatId, update, bot, ctx) => {
  const [argsLine, ...code] = (update.message?.text ?? update.message?.caption)?.split('\n') ?? [];
  const args = argsLine?.replace('/exec ', '').split(' ');

  const files = await getFiles(
    bot,
    update,
    ctx.getExtra<MediaGroupMiddleware>(MEDIA_GROUP_MIDDLEWARE_NAME)?.updates ?? [],
  );

  const output = await getCodeOutput(code, args, files);

  return bot.sendMessage(chatId, output);
});

export default router;
