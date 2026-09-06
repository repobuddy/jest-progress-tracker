import type { JestHookSubscriber, WatchPlugin } from 'jest-watcher'
import { append, init } from 'test-progress-tracker'
import { transformTestResults } from './transformTestResults.js'

init()

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

export class ProgressReporter implements WatchPlugin {
	// `append` is aliased onto the instance and called detached (`this.appendTestResult(...)`),
	// which `test-progress-tracker` supports and its own suite covers. Keep it that way.
	appendTestResult = append
	filtered = false

	async run(config: ProgressReporterConfig) {
		this.filtered = !!(config.testNamePattern || config.testPathPattern || hasTestPathPatterns(config.testPathPatterns))
	}

	apply(jestHooks: Pick<JestHookSubscriber, 'onTestRunComplete'>) {
		jestHooks.onTestRunComplete((results) => {
			const entry = transformTestResults(results)
			if (entry) {
				if (this.filtered) {
					entry.filtered = true
				}
				void this.appendTestResult(undefined, entry)
			}
		})
	}
}
