import chalk from 'chalk';
import ora from 'ora';

export const format = {
    error: (msg: string) => chalk.red(msg),
    success: (msg: string) => chalk.green(msg),
    info: (msg: string) => chalk.blue(msg),
    warn: (msg: string) => chalk.yellow(msg),
    dim: (msg: string) => chalk.dim(msg),
};