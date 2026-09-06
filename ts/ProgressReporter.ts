import type { AggregatedResult, TestContext } from '@jest/test-result'
import { append, init } from 'test-progress-tracker'
import { transformTestResults } from './transformTestResults.js'

/**
 * The subset of jest's global config this reporter reads.
 *
 * Declared locally rather than `Pick`ed out of `@jest/types`' `Config.GlobalConfig`
 * because jest 30 renamed `testPathPattern` (a string) to `testPathPatterns` (an array
 * of strings). Both are accepted here, so the reporter marks a run as filtered on every
 * jest line it supports instead of silently losing the flag on jest 30.
 */
export type ProgressReporterConfig = {
	testNamePattern?: string | undefined
	testPathPattern?: string | undefined
	// jest 30 replaced the `testPathPattern` string with a `TestPathPatterns` object
	// carrying a `patterns` array. Both shapes are accepted so that jest's own
	// `GlobalConfig` stays assignable to this type under `strictFunctionTypes`.
	testPathPatterns?: string[] | { patterns?: readonly string[] } | undefined
}

function hasTestPathPatterns(patterns: ProgressReporterConfig['testPathPatterns']) {
	if (!patterns) return false
	const list = Array.isArray(patterns) ? patterns : patterns.patterns
	return !!list && list.length > 0
}

function isFiltered(config: ProgressReporterConfig) {
	return !!(config.testNamePattern || config.testPathPattern || hasTestPathPatterns(config.testPathPatterns))
}

/**
 * A jest reporter that appends one entry per completed run.
 *
 * This is a `reporters` entry, not a `watchPlugins` entry. Jest constructs a custom
 * reporter as `new Reporter(globalConfig, options, context)` and awaits its
 * `onRunComplete`, which is why `filtered` is derived in the constructor: that is
 * where the run's `globalConfig` arrives. Jest builds a fresh scheduler — and so a
 * fresh reporter — for every run, including each re-run in watch mode, so `filtered`
 * tracks a pattern the user changes mid-watch instead of being fixed at startup.
 */
export class ProgressReporter {
	// `append` is aliased onto the instance and called detached (`this.appendTestResult(...)`),
	// which `test-progress-tracker` supports and its own suite covers. Keep it that way.
	appendTestResult = append
	filtered: boolean

	constructor(globalConfig: ProgressReporterConfig = {}) {
		// `init` is idempotent (mkdirp plus a store assignment). It lives here rather than at
		// module scope so that merely importing this package does not create `.progress/`.
		init()
		this.filtered = isFiltered(globalConfig)
	}

	async onRunComplete(_testContexts?: Set<TestContext>, results?: AggregatedResult) {
		if (!results) return
		const entry = transformTestResults(results)
		if (!entry) return
		if (this.filtered) entry.filtered = true
		// Awaited, not fire-and-forget: jest awaits `onRunComplete`, so the write is
		// guaranteed to land before the process exits.
		await this.appendTestResult(undefined, entry)
	}
}
