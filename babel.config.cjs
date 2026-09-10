// jest transforms the TypeScript specs through babel rather than ts-jest. That keeps the
// repo free to run TypeScript 7: ts-jest@29 peers `typescript: ">=4.3 <7"` and has no
// 30.x line, so it would pin this repo to TypeScript 5 for as long as it stayed.
// Type errors are caught by the separate `typecheck` script, not by the transform.
module.exports = {
	presets: [
		['@babel/preset-env', { targets: { node: 'current' } }],
		['@babel/preset-typescript', { allowNamespaces: true }]
	]
}
