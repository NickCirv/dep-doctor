# dep-doctor

Dependency health dashboard for Node.js projects — outdated packages, security vulnerabilities, unused deps, and duplicates in one shot.

<p align="center">
  <img src="https://img.shields.io/npm/v/dep-doctor.svg" alt="npm version" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg" alt="node >= 18" />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license" />
</p>

## Why

`npm outdated` and `npm audit` each give you one piece of the picture — raw data, no scoring, no prioritization. `dep-doctor` combines both, adds unused dependency detection and duplicate version analysis, then scores your project 0–100 and tells you exactly what to fix first.

## Quick Start

```bash
npx dep-doctor
```

Run from any directory with a `package.json`.

## What It Checks

- **Outdated packages** — classifies by patch / minor / major with current → latest diff
- **Security vulnerabilities** — runs `npm audit`, categorizes critical / high / moderate / low, lists fix availability
- **Unused dependencies** — scans `src/`, `bin/`, and root index files for imports; flags anything declared but never used
- **Duplicate package versions** — reads `package-lock.json` to find packages hoisted at multiple versions
- **Health score** — 100 points minus penalties: patch (-1ea), minor (-3ea), major (-8ea), critical vuln (-20), high (-10), moderate (-5), unused dep (-3), duplicate (-2)
- **Grade** — A (90+), B (80+), C (65+), D (50+), F

## Example Output

```
  ██████╗ ███████╗██████╗
  ██╔══██╗██╔════╝██╔══██╗
  ██║  ██║█████╗  ██████╔╝
  ██║  ██║██╔══╝  ██╔═══╝
  ██████╔╝███████╗██║      DOCTOR

  Dependency health dashboard for my-app v2.3.1

  ────────────────────────────────────────────────────────────

  Health Score
  ████████████████░░░░░░░░  74/100   B

  Outdated Packages
  Patch (safe)      3
  Minor (review)    2
  Major (breaking)  1

  [patch] lodash          4.17.20 → 4.17.21
  [minor] axios           0.27.0  → 0.28.1
  [major] webpack         4.46.0  → 5.88.0

  Security Vulnerabilities
  High    1  (fix available)
  Low     2

  Unused Dependencies
  Found 2 potentially unused packages:
  • moment
  • left-pad

  Summary
  • Fix 1 high severity vulnerability. Run: npm audit fix
  • 3 outdated packages. Run: dep-doctor fix to auto-update safe versions.
  • 2 unused packages. Run: dep-doctor fix to clean up.
```

## Commands

| Command | Description |
|---------|-------------|
| `dep-doctor` | Full report — scan + security + unused + duplicates |
| `dep-doctor scan` | Quick scan summary without full report |
| `dep-doctor report` | Full report (alias for default) |
| `dep-doctor fix` | Auto-update patch + minor; list major updates for manual review; remove unused |

## Use in CI

```yaml
- name: Dependency health check
  run: npx dep-doctor
```

Exit code is `0` when health is acceptable, non-zero if critical vulnerabilities are found.

## Install Globally

```bash
npm i -g dep-doctor
```

## License

MIT
