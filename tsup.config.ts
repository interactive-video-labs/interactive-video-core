import { defineConfig } from 'tsup';
import pkg from './package.json';

export default defineConfig((options) => ({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    watch: options.watch,
    clean: true,
    banner: {
        js: `/**
 * ${pkg.name} v${pkg.version}
 * Author: ${pkg.author}
 */
    `,
    },
}));