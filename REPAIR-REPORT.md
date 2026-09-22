# dep-doctor — repair evidence

Status: local candidate; independent verification pending. No upstream change or publication.

Source commit: `201f565c466217288310b003b2d5ee24c15182b8` from the public captured source. Original capture and other worktrees are unchanged.

## Change

Restored default/report/scan/fix dispatch; added the previously undeclared semver dependency and lockfile; made npm JSON adapters reject process/transport/parse errors rather than showing a clean report; gated updates with --yes and removals with a second explicit option.

## Files changed or added

- `README.md`
- `SOURCE-REVISION.json`
- `assets/nicholas-ashkar/CREDITS.md`
- `assets/nicholas-ashkar/banner.png`
- `bin/doctor.js`
- `package-lock.json`
- `package.json`
- `src/index.js`
- `src/npm-json.js`
- `src/scanner.js`
- `src/security.js`
- `test/cli.test.js`

Additional changed files from review: `src/fixer.js`, `test/fixer.test.js`.

## Commands and actual results

- `npm install --ignore-scripts --no-audit --no-fund`: exit 0; dependencies installed, lifecycle scripts disabled, lockfile recorded.
- `npm test`: exit 0; 13 tests passed, 0 failed, Node.js 26.7.0.
- No real registry audit/outdated/update/uninstall command, remote Git operation or deployment was executed by the tests.

## Verification scope and remaining work

The real CLI is exercised with a temporary fake npm executable, while mutation authorization is checked with injected helper stubs. Registry failures and malformed reports are tested. Existing import/duplicate heuristics are unchanged. Update execution remains mocked; completed commands do not claim an observed installed version. Real npm update/removal behavior and Node.js 20 execution remain unverified.

Original LICENSE bytes are unchanged. Banner/credits come from the approved portfolio baseline.

## Independent-review corrections

Scoped update arguments to the explicitly eligible patch/minor names, separated from npm options by --. Replaced claimed version upgrades with command-completed status and installedVersion: null. Added offline command-injection tests covering scope, unknown-only inputs and command failures.

Latest `npm test`: exit 0, 13 passed, 0 failed. Tests perform no real npm mutation or deployment.
