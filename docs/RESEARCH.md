# dep-doctor — documentation research

Reviewed 21 September 2026. Public GitHub source only.

## Revision and scope

- Commit: [`201f565c466217288310b003b2d5ee24c15182b8`](https://github.com/NickCirv/dep-doctor/commit/201f565c466217288310b003b2d5ee24c15182b8).
- Tree: `8ce9128785bfde45d1bdb4a3d3881e4eceedc75d`; truncated: `false`.
- Capture: 12 of 12 eligible text files; all eligible text files.
- Method: package and entrypoint inspection, implementation-interface review, targeted behavior/limitation inspection, and test-source review. This is not an exhaustive correctness or security audit.
- Commands run against repository code: **none**. External services, deployment and npm publication were not verified.

## Claim and evidence map

| Documentation claim | Pinned evidence | Assessment |
| --- | --- | --- |
| Runtime, executable and development commands | [package.json](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/package.json) | Source declaration inspected; runtime unverified |
| Contains dependency-analysis modules for outdated packages, audit findings and likely unused imports. | [bin/doctor.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/bin/doctor.js) | Implementation interfaces inspected; behavior not executed |
| Source includes package scanning, npm audit/outdated adapters, import heuristics, duplicate detection and dependency-fix helpers; CLI integration is incomplete. | [bin/doctor.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/bin/doctor.js), [src/fixer.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/src/fixer.js), [src/formatter.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/src/formatter.js), [src/outdated.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/src/outdated.js), [src/reporter.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/src/reporter.js), [src/scanner.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/src/scanner.js), [src/security.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/src/security.js) | Source-backed scope, not a test result |
| bin/doctor.js imports ../src/index.js, but src/index.js is missing. Restore and test that module before advertising a working CLI. npm outdated/audit contact registries; fixer modules can install or remove dependencies. | [bin/doctor.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/bin/doctor.js), [src/fixer.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/src/fixer.js), [src/formatter.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/src/formatter.js), [src/outdated.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/src/outdated.js), [src/reporter.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/src/reporter.js), [src/scanner.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/src/scanner.js), [src/security.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/src/security.js) | Material limits documented; service compatibility remains open |
| Existing checks | [test/smoke.test.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/test/smoke.test.js) | Test source read; no passing-run claim |

## Documentation inventory and disposition

| Existing document | Decision |
| --- | --- |
| [README.md](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/README.md) | Rewritten with source-specific purpose, direct checkout setup, limitations and verification status. Old section fragments retained where practical. |

Added `docs/REFERENCE.md` for the observed implementation and command surface, and this research record. Protected license and attribution files remain in their original locations without edits. No source or product UI was changed.

## Quality dimensions

| Dimension | Status | Evidence / next step |
| --- | --- | --- |
| Pinned provenance | Verified | Captured commit, tree and per-file hashes recorded below |
| Interface documentation | Partially verified | Source inspection only; run clean-checkout quickstart |
| Runtime behavior | Unverified | No repository execution in this review |
| Test results | Unverified | Existing tests were not run |
| Deployment / package availability | Unverified | No remote publish or live-service check |
| Visual / link checks | Unverified | Portfolio renderer and independent QA are separate from this authoring step |

## Unresolved issues

bin/doctor.js imports ../src/index.js, but src/index.js is missing. Restore and test that module before advertising a working CLI. npm outdated/audit contact registries; fixer modules can install or remove dependencies.

## Captured source inventory

This lists captured provenance, not a claim that every line received a full audit. Binary/generated/excluded files are outside the eligible text capture.

| File | SHA-256 | Bytes |
| --- | --- | --- |
| [LICENSE](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/LICENSE) | `68729cab364d82364078b08d8580ccfa51dc69c81a7d64e8d8d47a1da6c9349d` | 1072 |
| [README.md](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/README.md) | `6fb6402ea9d9071c87fa40ffcb751d9df055f28153e703b71e907a516af5340a` | 1816 |
| [package.json](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/package.json) | `389a47f8f33bebbd5e0e87626307f65aae6e46162853b8ef41e625f9d013cdf1` | 539 |
| [.github/workflows/ci.yml](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/.github/workflows/ci.yml) | `e818f4e6bd805f798665dbbf04964d02f12fc59dd7f18903ad63d26d374ae3f0` | 380 |
| [bin/doctor.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/bin/doctor.js) | `b2950070a3377719165db9cce3359bde70d72048de407613c6e6885136200cd1` | 66 |
| [src/fixer.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/src/fixer.js) | `7ccd905895071b9434c50da799c84672958b747a2b86967ed0e140c7f2ad476a` | 2979 |
| [src/formatter.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/src/formatter.js) | `f21cd81429ec99d61496549bd1441d663658540c584f37eccc748d7d85a2bd49` | 2720 |
| [src/outdated.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/src/outdated.js) | `b4bae02743a2f23d47a6dcf64f629a4d3f57103d7c50c99290d9214b7c4e313b` | 1730 |
| [src/reporter.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/src/reporter.js) | `45161cbf1a1b6bf4b91a71a4cd7b83558960d057eaa97d7d0a0803b11494ed27` | 8376 |
| [src/scanner.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/src/scanner.js) | `bbd61f4b7c3369f14dadc372f9f74c17cdf108efc94fdb71adb375abb7b2d299` | 5211 |
| [src/security.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/src/security.js) | `50efe8a4e1b737fe0d1e005dcb1618e60d6e9115f30a3c1251090dd6dbc0b4aa` | 2342 |
| [test/smoke.test.js](https://github.com/NickCirv/dep-doctor/blob/201f565c466217288310b003b2d5ee24c15182b8/test/smoke.test.js) | `0738b13a627dbe2366fe0ced4e61531d24399d07a7a9bc019c6ac8326de6b302` | 343 |
