<div align="center">

# dep-doctor

**Health score + fix plan for your Node.js dependencies — outdated, vulnerable, unused, and duplicate packages in one shot.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?labelColor=0B0A09)](LICENSE)
[![Node >=18](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg?labelColor=0B0A09)](https://nodejs.org)

</div>

## Install

```bash
npx github:NickCirv/dep-doctor
```

Run from any directory containing a `package.json`.

## Usage

```bash
# Full health report (outdated + vulnerabilities + unused + duplicates + score)
npx github:NickCirv/dep-doctor

# Auto-update patch + minor; list majors for manual review; remove unused
npx github:NickCirv/dep-doctor fix
```

| Command | Description |
|---------|-------------|
| `dep-doctor` | Full report — scan, security, unused, duplicates, health score |
| `dep-doctor scan` | Quick scan summary |
| `dep-doctor report` | Full report (alias for default) |
| `dep-doctor fix` | Auto-update safe versions; remove unused dependencies |

## What it does

`npm outdated` and `npm audit` each give you one piece of the picture — raw data, no scoring, no prioritization. `dep-doctor` combines both checks, adds unused dependency detection and duplicate version analysis, then scores your project 0–100 and outputs a prioritized fix plan.

Checks run: outdated packages (patch / minor / major), security vulnerabilities (critical → low), unused dependencies (scans `src/`, `bin/`, root index), and duplicate versions via `package-lock.json`. Health score deducts points per issue severity; grade is A–F.

Exit code is `0` when health is acceptable, non-zero on critical vulnerabilities — safe to use in CI.

---
<sub>Node >=18 · MIT · by <a href="https://github.com/NickCirv">NickCirv</a></sub>
