import chalk from 'chalk'
import {
  divider,
  header,
  tableRow,
  bulletItem,
  gradeBadge,
  severityBadge,
  updateBadge,
  scoreBar,
  countBadge,
} from './formatter.js'
import { parseOutdated } from './outdated.js'
import { parseAuditResults } from './security.js'

function computeScore(scan, securityData) {
  let score = 100

  // Outdated penalty
  const { patch, minor, major } = parseOutdated(scan.outdatedRaw)
  score -= patch.length * 1
  score -= minor.length * 3
  score -= major.length * 8

  // Security penalty
  const { summary } = parseAuditResults(securityData)
  score -= summary.critical * 20
  score -= summary.high * 10
  score -= (summary.moderate + summary.medium) * 5
  score -= summary.low * 2

  // Unused deps penalty
  score -= scan.unused.length * 3

  // Duplicate deps penalty
  score -= scan.duplicates.length * 2

  return Math.max(0, Math.min(100, score))
}

function scoreToGrade(score) {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 65) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

export function printFullReport(scan, securityData) {
  const score = computeScore(scan, securityData)
  const grade = scoreToGrade(score)
  const { patch, minor, major } = parseOutdated(scan.outdatedRaw)
  const { summary, vulnerabilities } = parseAuditResults(securityData)

  console.log()
  console.log(chalk.hex('#8B5CF6').bold(' ██████╗ ███████╗██████╗ '))
  console.log(chalk.hex('#8B5CF6').bold(' ██╔══██╗██╔════╝██╔══██╗'))
  console.log(chalk.hex('#8B5CF6').bold(' ██║  ██║█████╗  ██████╔╝'))
  console.log(chalk.hex('#8B5CF6').bold(' ██║  ██║██╔══╝  ██╔═══╝ '))
  console.log(chalk.hex('#8B5CF6').bold(' ██████╔╝███████╗██║     '))
  console.log(chalk.hex('#8B5CF6').bold(' ╚═════╝ ╚══════╝╚═╝     ') + chalk.gray('  DOCTOR'))
  console.log()
  console.log(
    chalk.gray('  Dependency health dashboard for ') +
      chalk.bold(scan.name) +
      chalk.gray(' v' + scan.version),
  )
  console.log()
  console.log(divider(60))
  console.log()

  // Health Score
  console.log(header('Health Score'))
  console.log()
  const scoreDisplay = `  ${scoreBar(score, 24)} ${score}/100  ${gradeBadge(grade)}`
  console.log(scoreDisplay)
  console.log()
  console.log(divider(60))
  console.log()

  // Overview
  console.log(header('Overview'))
  console.log()
  console.log(tableRow('Project', chalk.bold(scan.name)))
  console.log(tableRow('Version', chalk.gray('v' + scan.version)))
  console.log(tableRow('Dependencies', chalk.bold(scan.deps.length.toString())))
  console.log(tableRow('Dev Dependencies', chalk.bold(scan.devDeps.length.toString())))
  console.log(tableRow('Total', chalk.bold(scan.totalDeps.toString())))
  console.log()
  console.log(divider(60))
  console.log()

  // Outdated
  console.log(header('Outdated Packages'))
  console.log()
  if (scan.outdatedCount === 0) {
    console.log(chalk.green('  All packages are up to date.'))
  } else {
    console.log(
      tableRow('Patch (safe)', countBadge(patch.length, { warn: 0, error: 3 })),
    )
    console.log(
      tableRow('Minor (review)', countBadge(minor.length, { warn: 0, error: 3 })),
    )
    console.log(
      tableRow('Major (breaking)', countBadge(major.length, { warn: 0, error: 1 })),
    )
    console.log()

    for (const pkg of [...patch, ...minor, ...major]) {
      const badge = updateBadge(pkg.updateType)
      console.log(
        `  ${badge} ${chalk.bold(pkg.name.padEnd(30))} ${chalk.gray(pkg.current)} → ${chalk.green(pkg.latest)}`,
      )
    }
  }
  console.log()
  console.log(divider(60))
  console.log()

  // Security
  console.log(header('Security Vulnerabilities'))
  console.log()
  if (summary.total === 0) {
    console.log(chalk.green('  No vulnerabilities found.'))
  } else {
    if (summary.critical > 0)
      console.log(tableRow('Critical', countBadge(summary.critical, { warn: 0, error: 0 })))
    if (summary.high > 0)
      console.log(tableRow('High', countBadge(summary.high, { warn: 0, error: 0 })))
    if (summary.moderate > 0)
      console.log(tableRow('Moderate', countBadge(summary.moderate, { warn: 0, error: 2 })))
    if (summary.low > 0)
      console.log(tableRow('Low', countBadge(summary.low, { warn: 1, error: 5 })))
    console.log()

    const topVulns = vulnerabilities.slice(0, 8)
    for (const v of topVulns) {
      const badge = severityBadge(v.severity)
      const fix = v.fixAvailable ? chalk.green(' (fix available)') : chalk.gray(' (no fix)')
      console.log(`  ${badge} ${chalk.bold(v.package)}${fix}`)
      if (v.via.length > 0 && v.via[0].title) {
        console.log(chalk.gray(`         ${v.via[0].title}`))
      }
    }

    if (vulnerabilities.length > 8) {
      console.log(chalk.gray(`  ... and ${vulnerabilities.length - 8} more. Run: npm audit`))
    }
  }
  console.log()
  console.log(divider(60))
  console.log()

  // Unused
  console.log(header('Unused Dependencies'))
  console.log()
  if (scan.unused.length === 0) {
    console.log(chalk.green('  No unused dependencies detected.'))
  } else {
    console.log(chalk.yellow(`  Found ${scan.unused.length} potentially unused packages:`))
    console.log()
    for (const dep of scan.unused) {
      console.log(bulletItem(chalk.bold(dep)))
    }
    console.log()
    console.log(chalk.gray('  Note: verify manually before removing. Some may be peer deps.'))
  }
  console.log()
  console.log(divider(60))
  console.log()

  // Duplicates
  console.log(header('Duplicate Packages'))
  console.log()
  if (scan.duplicates.length === 0) {
    console.log(chalk.green('  No duplicate package versions detected.'))
  } else {
    console.log(chalk.yellow(`  Found ${scan.duplicates.length} packages with multiple versions:`))
    console.log()
    for (const dup of scan.duplicates.slice(0, 10)) {
      console.log(
        bulletItem(`${chalk.bold(dup.name)} ${chalk.gray('→')} ${dup.versions.join(', ')}`),
      )
    }
    if (scan.duplicates.length > 10) {
      console.log(chalk.gray(`  ... and ${scan.duplicates.length - 10} more`))
    }
    console.log()
    console.log(chalk.gray('  Run: npm dedupe to resolve'))
  }
  console.log()
  console.log(divider(60))
  console.log()

  // Summary + advice
  console.log(header('Summary'))
  console.log()
  const advice = getAdvice(score, grade, summary, scan)
  for (const line of advice) {
    console.log(bulletItem(line))
  }
  console.log()
}

function getAdvice(score, grade, summary, scan) {
  const advice = []

  if (summary.critical > 0) {
    advice.push(
      chalk.red.bold(`Fix ${summary.critical} critical vulnerability(ies) immediately.`) +
        chalk.gray(' Run: npm audit fix'),
    )
  }
  if (summary.high > 0) {
    advice.push(
      chalk.red(`Address ${summary.high} high severity vulnerability(ies).`) +
        chalk.gray(' Run: npm audit fix'),
    )
  }
  if (scan.outdatedCount > 0) {
    advice.push(
      chalk.yellow(`${scan.outdatedCount} outdated packages.`) +
        chalk.gray(' Run: dep-doctor fix to auto-update safe versions.'),
    )
  }
  if (scan.unused.length > 0) {
    advice.push(
      chalk.yellow(`${scan.unused.length} unused packages.`) +
        chalk.gray(' Run: dep-doctor fix to clean up.'),
    )
  }
  if (scan.duplicates.length > 0) {
    advice.push(chalk.gray(`${scan.duplicates.length} duplicate packages.`) + chalk.gray(' Run: npm dedupe'))
  }
  if (advice.length === 0) {
    advice.push(chalk.green('Project is in excellent health. Keep it up.'))
  }

  return advice
}

export function printScanSummary(scan) {
  console.log()
  console.log(header('Scan Complete'))
  console.log()
  console.log(tableRow('Package', chalk.bold(scan.name)))
  console.log(tableRow('Total deps', chalk.bold(scan.totalDeps.toString())))
  console.log(tableRow('Outdated', countBadge(scan.outdatedCount, { warn: 1, error: 5 })))
  console.log(tableRow('Unused', countBadge(scan.unused.length, { warn: 1, error: 3 })))
  console.log(tableRow('Duplicates', countBadge(scan.duplicates.length, { warn: 1, error: 5 })))
  console.log()
  console.log(chalk.gray('  Run dep-doctor report for full analysis'))
  console.log()
}
