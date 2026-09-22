# dep-doctor — implementation reference

Source revision: `201f565c466217288310b003b2d5ee24c15182b8`. This reference records source declarations; it is not a transcript of a successful run.

## Entrypoint and runtime

[package.json](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/package.json) declares `bin/doctor.js`. Node.js `>=20` and npm.

Executable mapping: `dep-doctor` → `./bin/doctor.js`.

## Supported workflow

Source includes package scanning, npm audit/outdated adapters, import heuristics, duplicate detection and dependency-fix helpers; CLI integration is incomplete.

bin/doctor.js imports ../src/index.js, but src/index.js is missing. Restore and test that module before advertising a working CLI. npm outdated/audit contact registries; fixer modules can install or remove dependencies.

## Current CLI blocker

`bin/doctor.js` imports `../src/index.js`; that module is absent from the pinned tree. The earlier README described scan/report/fix commands, but there is no captured command dispatcher to substantiate those interfaces. They are intentionally not documented as runnable commands.

The surviving scanner modules read package manifests and source imports, invoke npm outdated/audit and examine installed duplicates. Fixer helpers can perform npm installs and removals. Restore the dispatcher, exercise harmless report paths and test mutation boundaries before documenting an operational CLI.

## Package scripts

| Script | Exact command |
| --- | --- |
| `start` | `node bin/doctor.js` |
| `test` | `node --test` |

## Implementation sources

[bin/doctor.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/bin/doctor.js), [src/fixer.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/src/fixer.js).

## Verification boundary

No repository code, tests, network operation, hook installer or migration was executed for this review. Source inspection supports the documented interface; runtime correctness and external-service compatibility remain unverified.
