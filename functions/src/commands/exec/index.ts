import { Command, CommanderError, Option, Argument } from '@commander-js/extra-typings';

import Router from '../../Router';
import { execCode } from './service';
import languages from './languages';

const router = new Router();

const defaultLang = 'js';

async function getCodeOutput(code: string[], args: string[]) {
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

    const response = await execCode({ properties: languages[lang].buildOptions(code.join('\n')) });

    return response.stdout || response.stderr || 'Program did not output anything';
  } catch (err: unknown) {
    if (err instanceof CommanderError) {
      return programOutput;
    } else {
      return `${err}`;
    }
  }
}

router.botCommand('/exec', async (chatId, update, bot) => {
  const [argsLine, ...code] = update.message?.text?.split('\n') ?? [];
  const args = argsLine?.replace('/exec ', '').split(' ');

  const output = await getCodeOutput(code, args);

  return bot.sendMessage(chatId, output);
});

export default router;
