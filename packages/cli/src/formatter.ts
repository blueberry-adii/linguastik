import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';

export const format = {
    success: (msg: string) => chalk.green('✔ ' + msg),
    error: (msg: string) => chalk.red('✖ ' + msg),
    warn: (msg: string) => chalk.yellow('⚠ ' + msg),
    info: (msg: string) => chalk.blue('ℹ ' + msg),
    dim: (msg: string) => chalk.gray(msg),

    box: (title: string, content: string, color: 'green' | 'red' | 'yellow' | 'blue' = 'blue') => {
        return boxen(content, {
            title: title,
            titleAlignment: 'left',
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: color,
        });
    },

    spinner: (text: string) => ora(text),
};