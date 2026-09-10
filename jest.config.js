// The repo runs its own built reporter over its own test run — `esm/index.js` is the
// package's published entry point, so `test` and `coverage` depend on `build`.
//
// The package is ESM, but the specs still run through babel's CommonJS transform: jest
// only treats `.ts` as ESM when it is listed in `extensionsToTreatAsEsm`, and native ESM
// in jest still needs `--experimental-vm-modules`. `moduleNameMapper` maps the
// ESM-mandated `./x.js` specifiers back onto the TypeScript sources.
export default {
	reporters: ['default', '<rootDir>/esm/index.js'],
	roots: ['<rootDir>/ts'],
	testEnvironment: 'node',
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1'
	},
	collectCoverageFrom: ['ts/**/*.ts', '!ts/**/*.spec.ts', '!ts/testResultsExamples.ts'],
	coverageReporters: ['text', 'lcov'],
	// Set to what the suite already meets, so a regression fails the build instead of
	// quietly reporting a lower number.
	coverageThreshold: {
		global: { statements: 95, branches: 90, functions: 95, lines: 95 }
	},
	watchPlugins: [
		['jest-watch-suspend'],
		['jest-watch-toggle-config', { setting: 'verbose' }],
		['jest-watch-toggle-config', { setting: 'collectCoverage' }]
	]
}
