import a from 'assertron'
import type { TestResults } from 'test-progress-tracker'
import ProgressReporter from './index.js'
import { noCoverage } from './testResultsExamples.js'

test('mark filtered if there is testNamePattern', async () => {
	const subject = new ProgressReporter()
	let actual: TestResults
	subject.appendTestResult = (_, results) => {
		actual = results
		return Promise.resolve()
	}
	await subject.run({ testNamePattern: 'a' })
	subject.apply({
		onTestRunComplete(fn) {
			fn(noCoverage as any)
		}
	})

	a.satisfies(actual!, { ...noCoverage, duration: (d: number) => typeof d === 'number', filtered: true })
})

test('mark filtered if there is testPathPattern', async () => {
	const subject = new ProgressReporter()
	let actual: TestResults
	subject.appendTestResult = (_, results) => {
		actual = results
		return Promise.resolve()
	}
	await subject.run({ testNamePattern: 'a' })
	subject.apply({
		onTestRunComplete(fn) {
			fn(noCoverage as any)
		}
	})

	a.satisfies(actual!, { ...noCoverage, duration: (d: number) => typeof d === 'number', filtered: true })
})

test('mark filtered if there is testNamePattern and testPathPattern', async () => {
	const subject = new ProgressReporter()
	let actual: TestResults
	subject.appendTestResult = (_, results) => {
		actual = results
		return Promise.resolve()
	}
	await subject.run({ testNamePattern: 'y', testPathPattern: 'a' })
	subject.apply({
		onTestRunComplete(fn) {
			fn(noCoverage as any)
		}
	})

	a.satisfies(actual!, { ...noCoverage, duration: (d: number) => typeof d === 'number', filtered: true })
})

test('not filtered if there is no testNamePattern or testPathPattern', async () => {
	const subject = new ProgressReporter()
	let actual: TestResults
	subject.appendTestResult = (_, results) => {
		actual = results
		return Promise.resolve()
	}

	await subject.run({})
	subject.apply({
		onTestRunComplete(fn) {
			fn(noCoverage as any)
		}
	})

	a.satisfies(actual!, (e: TestResults) => e.filtered === undefined)
})

test('no test will not append', async () => {
	const subject = new ProgressReporter()
	subject.appendTestResult = () => {
		throw new Error('should not call')
	}

	await subject.run({})
	subject.apply({
		onTestRunComplete(fn) {
			fn({} as any)
		}
	})
})

// function aggregateResult(testResults: TestResults) {
//   const result: jest.AggregatedResult = { ...testResults } as any
//   if (testResults.coverage) {
//     result.coverageMap = {
//       getCoverageSummary() { return testResults.coverage }
//     } as any
//   }

//   return result
// }

test('mark filtered if there is testPathPatterns (jest 30)', async () => {
	const subject = new ProgressReporter()
	let actual: TestResults
	subject.appendTestResult = (_, results) => {
		actual = results
		return Promise.resolve()
	}
	await subject.run({ testPathPatterns: ['a'] })
	subject.apply({
		onTestRunComplete(fn) {
			fn(noCoverage as any)
		}
	})

	a.satisfies(actual!, { ...noCoverage, duration: (d: number) => typeof d === 'number', filtered: true })
})

test('not filtered if testPathPatterns is empty (jest 30)', async () => {
	const subject = new ProgressReporter()
	let actual: TestResults
	subject.appendTestResult = (_, results) => {
		actual = results
		return Promise.resolve()
	}
	await subject.run({ testPathPatterns: [] })
	subject.apply({
		onTestRunComplete(fn) {
			fn(noCoverage as any)
		}
	})

	a.satisfies(actual!, (e: TestResults) => e.filtered === undefined)
})
