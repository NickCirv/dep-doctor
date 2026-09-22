![Nicholas Ashkar — dep-doctor](assets/nicholas-ashkar/banner.png)

# dep-doctor

Inspect an npm project's dependency versions, audit findings, likely unused imports and duplicate installations from one CLI.

> **Local repair candidate.** This copy restores the missing command dispatcher. It has not been published or applied to the upstream repository.

## Start locally

Requires Node.js 20 or newer and npm 8 or newer. In this candidate directory:

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

`npm test` passed **13 tests** on Node.js 26.7.0 for this candidate. Tests launch the real CLI against temporary project fixtures with a fake npm adapter; they cover default/report/scan dispatch, error handling and explicit mutation authorization. Update/removal helpers are mocked in authorization tests, so no real dependency update, uninstall or audit request was performed by the suite. Node.js 20 compatibility and live registry behavior remain unverified.

See [repair evidence](REPAIR-REPORT.md) for the exact scope. This result supports the local startup repair, not a claim that every dependency-management edge case is resolved.

## License and contact

[MIT license](LICENSE); original attribution is unchanged. Artwork credits are in [CREDITS.md](assets/nicholas-ashkar/CREDITS.md).

[Nicholas Ashkar](https://nicholashkar.com/) · [Discuss a project](https://nicholashkar.com/#contact)
