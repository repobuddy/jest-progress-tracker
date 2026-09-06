module.exports = () => {
	return {
		files: [{ pattern: 'tsconfig.*', instrument: false }, 'ts/**/*.ts', '!ts/**/*.spec.ts'],
		tests: ['ts/**/*.spec.ts'],
		env: { type: 'node', runner: 'node' },
		testFramework: 'jest'
	}
}
