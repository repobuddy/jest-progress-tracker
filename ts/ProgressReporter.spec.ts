import a from 'assertron'
import type { TestResults } from 'test-progress-tracker'
import ProgressReporter from './index.js'
import { noCoverage } from './testResultsExamples.js'

function subjectWith(config?: ConstructorParameters<typeof ProgressReporter>[0]) {
	const subject = new ProgressReporter(config)
	const appended: TestResults[] = []
	subject.appendTestResult = (_, results) => {
		appended.push(results)
		return Promise.resolve()
	}
	return { subject, appended }
}

test('mark filtered if there is testNamePattern', async () => {
	const { subject, appended } = subjectWith({ testNamePattern: 'a' })

	await subject.onRunComplete(undefined, noCoverage as any)

	a.satisfies(appended[0]!, { ...noCoverage, duration: (d: number) => typeof d === 'number', filtered: true })
})

test('mark filtered if there is testPathPattern', async () => {
	const { subject, appended } = subjectWith({ testPathPattern: 'a' })

	await subject.onRunComplete(undefined, noCoverage as any)

	a.satisfies(appended[0]!, { ...noCoverage, duration: (d: number) => typeof d === 'number', filtered: true })
})

test('mark filtered if there is testNamePattern and testPathPattern', async () => {
	const { subject, appended } = subjectWith({ testNamePattern: 'y', testPathPattern: 'a' })

	await subject.onRunComplete(undefined, noCoverage as any)

	a.satisfies(appended[0]!, { ...noCoverage, duration: (d: number) => typeof d === 'number', filtered: true })
})

test('not filtered if there is no testNamePattern or testPathPattern', async () => {
	const { subject, appended } = subjectWith({})

	await subject.onRunComplete(undefined, noCoverage as any)

	a.satisfies(appended[0]!, (e: TestResults) => e.filtered === undefined)
})

test('not filtered when jest passes no config at all', async () => {
	const { subject, appended } = subjectWith()

	await subject.onRunComplete(undefined, noCoverage as any)

	a.satisfies(appended[0]!, (e: TestResults) => e.filtered === undefined)
})

test('no test will not append', async () => {
	const { subject, appended } = subjectWith({})

	await subject.onRunComplete(undefined, {} as any)

	a.satisfies(appended, (e: TestResults[]) => e.length === 0)
})

test('an absent result will not append', async () => {
	const { subject, appended } = subjectWith({})

	await subject.onRunComplete()

	a.satisfies(appended, (e: TestResults[]) => e.length === 0)
})

test('mark filtered if there is testPathPatterns (jest 30)', async () => {
	const { subject, appended } = subjectWith({ testPathPatterns: ['a'] })

	await subject.onRunComplete(undefined, noCoverage as any)

	a.satisfies(appended[0]!, { ...noCoverage, duration: (d: number) => typeof d === 'number', filtered: true })
})

test('mark filtered if testPathPatterns is a TestPathPatterns object (jest 30)', async () => {
	const { subject, appended } = subjectWith({ testPathPatterns: { patterns: ['a'] } })

	await subject.onRunComplete(undefined, noCoverage as any)

	a.satisfies(appended[0]!, { ...noCoverage, duration: (d: number) => typeof d === 'number', filtered: true })
})

test('not filtered if testPathPatterns is empty (jest 30)', async () => {
	const { subject, appended } = subjectWith({ testPathPatterns: [] })

	await subject.onRunComplete(undefined, noCoverage as any)

	a.satisfies(appended[0]!, (e: TestResults) => e.filtered === undefined)
})

test('the reporter shape jest actually calls', async () => {
	// Guards the bug this file previously missed: the class implemented `jest-watcher`'s
	// `WatchPlugin` (`run` + `apply`), which jest never invokes for a `reporters` entry,
	// so the package silently did nothing. Assert the reporter contract instead.
	const subject = new ProgressReporter({})
	a.satisfies(typeof subject.onRunComplete, (t: string) => t === 'function')
	a.satisfies((subject as any).apply, (v: unknown) => v === undefined)
	a.satisfies((subject as any).run, (v: unknown) => v === undefined)
})
