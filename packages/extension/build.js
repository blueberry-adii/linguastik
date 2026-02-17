import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWatch = process.argv.includes('--watch');

const sharedPath = path.resolve(__dirname, '../../shared/src');

const commonOptions = {
    define: {
        'process.env.SERPER_API_KEY': JSON.stringify(process.env.SERPER_API_KEY || ''),
        'process.env.LINGO_API_KEY': JSON.stringify(process.env.LINGO_API_KEY || ''),
    },
    bundle: true,
    outdir: 'dist',
    sourcemap: true,
    logLevel: 'info',
    alias: {
        '@linguastik/shared/dist/cache': './src/shims/cache.ts',
        '@linguastik/shared/dist/config': './src/shims/config.ts',
        'fs': './src/shims/empty.ts',
        'path': './src/shims/empty.ts',
        'os': './src/shims/empty.ts',
        'crypto': './src/shims/empty.ts',
    },
};

const copyStaticPlugin = {
    name: 'copy-static',
    setup(build) {
        build.onEnd(() => {
            fs.copyFileSync('manifest.json', 'dist/manifest.json');
            fs.copyFileSync('popup.html', 'dist/popup.html');
            if (fs.existsSync('icons')) {
                fs.cpSync('icons', 'dist/icons', { recursive: true });
            }
        });
    },
};

const backgroundOptions = {
    ...commonOptions,
    entryPoints: {
        background: './src/background.ts',
    },
    platform: 'browser',
    target: 'es2022',
    format: 'esm',
};

const contentOptions = {
    ...commonOptions,
    entryPoints: {
        content: './src/content.ts',
        popup: './src/popup.ts',
    },
    platform: 'browser',
    target: 'es2022',
    format: 'iife',
    plugins: [copyStaticPlugin],
};

if (isWatch) {
    const ctxBg = await esbuild.context(backgroundOptions);
    const ctxContent = await esbuild.context(contentOptions);
    await Promise.all([ctxBg.watch(), ctxContent.watch()]);
    console.log('Watching...');
} else {
    await Promise.all([
        esbuild.build(backgroundOptions),
        esbuild.build(contentOptions)
    ]);
    console.log('Build complete');
}
