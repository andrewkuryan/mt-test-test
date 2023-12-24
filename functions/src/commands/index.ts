import { Command } from './Command';
import echo from './echo';
import exec from './exec';

const commands: Array<Command> = [echo, exec];

export default commands;
