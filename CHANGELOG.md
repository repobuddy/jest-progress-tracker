# jest-progress-tracker

## 4.0.0

### Major Changes

- a2421ba: Ship ESM only.
  
  The package is now `"type": "module"` and tsdown emits a single ES module output at
  `esm/` (it used to emit CommonJS at `cjs/`). There is no CommonJS entry any more, so the
  `cjsDefault: false` interop shape is gone with it.
  
  Migration:
  
  - Requires Jest 27 or later — the `jest` peer range moved from `>=24.0.0` to `>=27.0.0`.
    Jest loads custom reporters with `requireOrImportModule`, which falls back to
    `await import()` on an ESM module; support for ESM reporters landed in Jest 27. Jest
    28+ is what the exports map is aimed at; on Jest 27, which ignores `exports`, `main`
    points at the same ES module.
  - Requires Node 20 or later.
  - `require('jest-progress-tracker')` no longer works. Nothing changes for the documented
    usage — listing `"jest-progress-tracker"` in Jest's `reporters` keeps working as before.
  - The exports map deliberately publishes the ES module under the `default` condition
    rather than `import`: Jest resolves reporter paths with the default condition set
    (`require`, `node`, `default`) and never asks for `import`, so an `import`-only map
    fails to resolve with "Could not resolve a module for a custom reporter".
- dbece6c: Fix: the reporter never recorded anything.
  
  `ProgressReporter` implemented `jest-watcher`'s `WatchPlugin` interface (`run` + `apply`), but the README documents the package as a `reporters` entry. Jest never calls `run` or `apply` on a reporter, so listing it in `reporters` — the only documented usage — did nothing beyond creating an empty `.progress/` directory at import.
  
  It was broken in the watch-plugin role too. Jest only invokes `WatchPlugin.run` for the plugin whose `getUsageInfo().key` matches a keypress, and this class has no `getUsageInfo`, so `run` was unreachable and `filtered` was permanently `false`.
  
  The class is now a plain jest reporter:
  
  - `onRunComplete(testContexts, results)` replaces `apply` + the `onTestRunComplete` hook.
  - `filtered` is derived in the constructor from the `globalConfig` jest passes to every custom reporter, replacing `run`. Jest builds a fresh reporter for each run, including every re-run in watch mode, so a pattern changed mid-watch is now tracked instead of being fixed at startup.
  - The append is awaited rather than fire-and-forget, so the write lands before the process exits.
  - `init()` moved from module scope into the constructor — importing the package no longer creates `.progress/` as a side effect.
  
  **Breaking:** `run` and `apply` are gone. If you listed this package under `watchPlugins`, move it to `reporters`. It now works in both watch and non-watch runs, where the watch-plugin form only ever ran under `--watch`.
  
  `jest-watcher` is no longer a dependency.

### Patch Changes

- f5b5fa7: Declare a supported Node range: `^20.19.0 || ^22.13.0 || >=24`.
  
  Every version in that range has unflagged `require(esm)`, so a CommonJS consumer's
  `require()` of this now-ESM-only package resolves rather than throwing `ERR_REQUIRE_ESM`.
  Node 18 (EOL April 2025) and Node 20.0–20.18 are excluded because `require()` hard-fails there.

## 3.1.0

### Minor Changes

- bf269ea: Support jest 30, and widen the supported jest range to 29 and 30.
  
  `run()` used to read `testPathPattern`, a string on jest's `GlobalConfig`. Jest 30
  replaced it with `testPathPatterns`, so on jest 30 a filtered run was never marked
  `filtered`. Both shapes are now accepted — the string, the array, and jest 30's
  `TestPathPatterns` object — so the flag is set on every jest line this package supports.
  
  The config parameter is no longer `Pick`ed out of `@jest/types`; it is an exported
  `ProgressReporterConfig` type. `@jest/types` is consequently no longer a dependency, and
  `@jest/test-result` and `jest-watcher` move from `^27` to `^29 || ^30`.
  
  The tarball also now ships the `ts/` sources alongside the compiled `cjs/` output. The
  compiled output itself is emitted by tsdown instead of `tsc`; the paths, the CommonJS
  format and the `exports.default` / `__esModule` interop shape are unchanged.

## 3.0.5

### Patch Changes

- 8c0c1b3: Publish through GitHub OIDC / npm trusted publishing instead of a long-lived `NPM_TOKEN`, and release with changesets instead of semantic-release. Repository metadata now points at `cyberuni/jest-progress-tracker`.
