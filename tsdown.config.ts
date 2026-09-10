import { defineConfig } from 'tsdown'

// The published surface is ESM at `esm/`, one file per module, with declarations and
// source maps — `main: esm/index.js`, `typings: esm/index.d.ts`, and an exports map whose
// ESM entry sits under `default`. Jest loads the reporter with `requireOrImportModule`,
// which imports an ES module, and the repo's own `jest.config.js` points at
// `<rootDir>/esm/index.js`, so the paths and the format are a contract, not a preference.
// `unbundle` keeps the one-file-per-module shape `tsc` used to emit, and `outExtensions`
// stops tsdown moving the output to `.mjs` / `.d.mts`.
export default defineConfig({
	// `transformTestResults` is a second entry only so its `.d.ts` keeps being emitted:
	// `tsc` used to declare every file it compiled, and dropping a declaration for an
	// already-published path is a surface reduction for anyone deep-importing it.
	entry: ['ts/index.ts', 'ts/transformTestResults.ts'],
	format: 'esm',
	outDir: 'esm',
	unbundle: true,
	dts: true,
	sourcemap: true,
	clean: true,
	target: 'node20',
	outExtensions: () => ({ js: '.js', dts: '.d.ts' })
})
