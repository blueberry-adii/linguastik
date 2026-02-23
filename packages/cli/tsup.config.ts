import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs'],
    target: 'node18',
    platform: 'node',
    outDir: 'dist',
    bundle: true,
    shims: true,
    noExternal: ['@linguastik/shared'],
    external: ['chalk', 'boxen', 'ora', 'commander', 'dotenv'],
    splitting: false,
    sourcemap: false,
    clean: true,
});

