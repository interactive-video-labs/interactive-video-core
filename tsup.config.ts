import { defineConfig } from 'tsup';
import pkg from './package.json';

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  outExtension({ format }) {
    return {
      js: `.${format === 'esm' ? 'mjs' : 'cjs'}`,
    };
  },
  dts: true,
  watch: options.watch,
  clean: true,
  banner: {
    js: `/**
 * 
 * ${pkg.description}
 * ${pkg.name} v${pkg.version}
 * @author ${pkg.author}
 * @license ${pkg.license}
 * 
 */
    `,
  },
}));
