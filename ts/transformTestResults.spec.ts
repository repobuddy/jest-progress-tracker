import type { AggregatedResult } from '@jest/test-result'
import a from 'assertron'
import type { CoverageMap } from 'istanbul-lib-coverage'
import { isInRange } from 'satisfier'
import { transformTestResults } from './transformTestResults.js'

test('return undefined if test was interrupted', () => {
	expect(
		transformTestResults(createTestResults({ numFailedTests: 1, numTotalTests: 1, wasInterrupted: true }))
	).toBeUndefined()
})

test('no coverage is ok', () => {
	const testResults = createTestResults({ numFailedTests: 1, numTotalTests: 1 })

	a.satisfies(transformTestResults(testResults), testResults)
})

test('skipped test run will be undefined', () => {
	expect(transformTestResults(createTestResults({ numTotalTests: 0 }))).toBeUndefined()
})

test('coverage', () => {
	const testResults = createTestResults({
		numTotalTests: 1,
		coverageMap: {
			getCoverageSummary: () => ({
				branches: { covered: 0, skipped: 0, total: 0, pct: 0 },
				functions: { covered: 0, skipped: 0, total: 0, pct: 0 },
				lines: { covered: 0, skipped: 0, total: 0, pct: 0 },
				statements: { covered: 0, skipped: 0, total: 0, pct: 0 }
			})
		} as CoverageMap
	})
	const actual = transformTestResults(testResults)
	a.satisfies(actual, {
		coverage: {
			branches: { covered: 0, skipped: 0, total: 0 },
			functions: { covered: 0, skipped: 0, total: 0 },
			lines: { covered: 0, skipped: 0, total: 0 },
			statements: { covered: 0, skipped: 0, total: 0 }
		}
	})
})
test('record duration', () => {
	a.satisfies(transformTestResults(createTestResults({ numTotalTests: 1, startTime: Date.now() - 100 })), {
		duration: isInRange(100, 101)
	})
})

test('has start time', () => {
	const startTime = Date.now()
	a.satisfies(transformTestResults(createTestResults({ numTotalTests: 1, startTime })), { startTime })
})

function createTestResults(partial: Partial<AggregatedResult>) {
	return partial as AggregatedResult
}
