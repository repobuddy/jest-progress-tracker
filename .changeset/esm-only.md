---
'jest-progress-tracker': major
---

Ship ESM only.

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
