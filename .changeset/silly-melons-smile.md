---
'jest-progress-tracker': major
---

Fix: the reporter never recorded anything.

`ProgressReporter` implemented `jest-watcher`'s `WatchPlugin` interface (`run` + `apply`), but the README documents the package as a `reporters` entry. Jest never calls `run` or `apply` on a reporter, so listing it in `reporters` — the only documented usage — did nothing beyond creating an empty `.progress/` directory at import.

It was broken in the watch-plugin role too. Jest only invokes `WatchPlugin.run` for the plugin whose `getUsageInfo().key` matches a keypress, and this class has no `getUsageInfo`, so `run` was unreachable and `filtered` was permanently `false`.

The class is now a plain jest reporter:

- `onRunComplete(testContexts, results)` replaces `apply` + the `onTestRunComplete` hook.
- `filtered` is derived in the constructor from the `globalConfig` jest passes to every custom reporter, replacing `run`. Jest builds a fresh reporter for each run, including every re-run in watch mode, so a pattern changed mid-watch is now tracked instead of being fixed at startup.
- The append is awaited rather than fire-and-forget, so the write lands before the process exits.
- `init()` moved from module scope into the constructor — importing the package no longer creates `.progress/` as a side effect.

**Breaking:** `run` and `apply` are gone. If you listed this package under `watchPlugins`, move it to `reporters`. It now works in both watch and non-watch runs, where the watch-plugin form only ever ran under `--watch`.

`jest-watcher` is no longer a dependency.
