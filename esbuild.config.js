import { createRequire } from 'node:module';

import { build } from 'esbuild';

const manifest = createRequire(import.meta.url)('./package.json');

const target = {
    platform: 'node',
    format: 'esm',
    // Exclude dependencies when bundling
    external: Object.keys(manifest.dependencies)
};

// Build library
build({
    entryPoints: ['lib/index.ts'],
    outfile: 'dist/index.js',
    ...target,
    bundle: true,
    minify: false
});

// Build CLI application
build({
    entryPoints: ['src/cli.ts'],
    outfile: 'dist/cli.js',
    ...target,
    bundle: true,
    minify: true
});