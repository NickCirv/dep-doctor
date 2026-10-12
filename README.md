![Nicholas Ashkar — dep-doctor](assets/nicholas-ashkar/banner.png)

# dep-doctor

Inspect an npm project's dependency versions, audit findings, likely unused imports and duplicate installations from one CLI.

## Start locally

Requires Node.js 20 or newer and npm 8 or newer. From a clone of this repository:

```sh
npm ci --ignore-scripts --no-audit --no-fund
node bin/doctor.js --help
```

Inspect another project by supplying its directory:

```sh
node bin/doctor.js --cwd /path/to/project scan
node bin/doctor.js --cwd /path/to/project report
```

`scan` queries `npm outdated` and examines local imports and the npm lockfile. `report`, also the default with no command, adds `npm audit` findings and a heuristic score. These inspection commands do not update dependencies, but npm contacts its configured registry. Process failures, invalid JSON and npm error objects return a nonzero exit instead of being treated as clean reports.

## Commands

| Command | Behavior |
| --- | --- |
| No command / `report` | Full dependency and audit report |
| `scan` | Version, unused-import and duplicate summary without the audit call |
| `fix --yes` | Explicitly authorize the existing npm-update helper |
| `fix --yes --remove-unused` | Also authorize uninstalling heuristically unused dependencies |
| `--cwd DIRECTORY` | Target project; defaults to the current working directory |
| `--help`, `--version` | Inspect the CLI without scanning |

`fix` without `--yes` stops before scanning or writing. The update helper invokes `npm update -- NAME...` with only the eligible patch/minor package names. npm still applies declared manifest ranges and may adjust transitive dependencies. Successful output confirms command completion and explicitly leaves the installed version unverified; inspect the resulting lockfile. Major upgrades are listed for manual review. Removal requires the separate `--remove-unused` flag because tools used only by scripts, config or generated code can look unused to the scanner. Review version-control changes and run the target project's tests after any mutation.

## Reading the report

The score combines version age, audit severity, unused-import candidates and duplicate versions. It is a prioritization heuristic, not a security certification. Import scanning covers selected source extensions and locations; dynamic loading and build tooling can be missed. npm results depend on registry availability, lockfile state and the report schema.

## Validation

`npm test` passed **15 tests** on Node.js 26.7.0. Tests launch the real CLI against temporary project fixtures and the committed sample project in `test/fixtures/basic-project`, using a fake npm adapter; they cover default/report/scan dispatch, error handling, the lockfile-less audit failure and explicit mutation authorization. Update/removal helpers are mocked in authorization tests, so the suite performs no real dependency update, uninstall or audit request. GitHub Actions CI runs the same suite on Node.js 20 and 22.

A separate manual run on Node.js 26.7.0 against the live npm registry verified `scan`, `report` and `fix --yes` end to end on a scratch project; `fix --yes` updated left-pad 1.0.0 to 1.3.0 in that project's lockfile and `node_modules`. Reports on projects without a `package-lock.json` (for example yarn or pnpm projects) exit nonzero and relay npm's `ENOLOCK` guidance.

See [repair evidence](REPAIR-REPORT.md) for the history of the May 2026 startup repair. These results support the commands above, not a claim that every dependency-management edge case is resolved.

## License and contact

[MIT license](LICENSE); original attribution is unchanged. Artwork credits are in [CREDITS.md](assets/nicholas-ashkar/CREDITS.md).

[Nicholas Ashkar](https://nicholashkar.com/) · [Discuss a project](https://nicholashkar.com/#contact)
