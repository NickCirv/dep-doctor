import { execFileSync } from 'child_process'
import chalk from 'chalk'
import { divider, header, bulletItem } from './formatter.js'

function runNpm(args, cwd) {
  return execFileSync('npm', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  })
}

export async function fixSafeUpdates(categorized, cwd = process.cwd()) {
  const { patch, minor, major, unknown } = categorized
  const results = {
    updated: [],
    skipped: [],
    failed: [],
    manualReview: [],
  }

  const safePackages = [...patch, ...minor]

  if (safePackages.length === 0 && major.length === 0) {
    console.log(chalk.green('  All dependencies are up to date. Nothing to fix.'))
    return results
  }

  // Auto-update patch + minor
  if (safePackages.length > 0) {
    console.log(header('Auto-updating patch + minor versions'))
    console.log()

    try {
      runNpm(['update'], cwd)

      for (const pkg of safePackages) {
        results.updated.push(pkg)
        const badge = pkg.updateType === 'patch' ? chalk.green('patch') : chalk.yellow('minor')
        console.log(
          bulletItem(
            `${chalk.bold(pkg.name)} ${chalk.gray(pkg.current)} → ${chalk.green(pkg.latest)} (${badge})`,
          ),
        )
      }
      console.log()
      console.log(chalk.green(`  Updated ${safePackages.length} packages via npm update`))
    } catch (err) {
      console.log(chalk.red(`  npm update failed: ${err.message}`))
      for (const pkg of safePackages) {
        results.failed.push({ ...pkg, error: err.message })
      }
    }
  }

  // List major updates for manual review
  if (major.length > 0) {
    console.log()
    console.log(divider())
    console.log()
    console.log(header('Major updates require manual review'))
    console.log(chalk.gray('  Breaking changes likely. Review changelogs before upgrading.\n'))

    for (const pkg of major) {
      results.manualReview.push(pkg)
      console.log(
        bulletItem(
          `${chalk.bold(pkg.name)} ${chalk.gray(pkg.current)} → ${chalk.red(pkg.latest)} ${chalk.gray('(major)')}`,
        ),
      )
      console.log(
        chalk.gray(
          `    Run: npm install ${pkg.name}@${pkg.latest} to upgrade individually`,
        ),
      )
    }
  }

  return results
}

export async function removeUnusedDeps(unusedList, cwd = process.cwd()) {
  const results = { removed: [], failed: [] }

  if (unusedList.length === 0) {
    console.log(chalk.green('  No unused dependencies detected.'))
    return results
  }

  console.log(header('Removing unused dependencies'))
  console.log()

  for (const dep of unusedList) {
    try {
      runNpm(['uninstall', dep], cwd)
      results.removed.push(dep)
      console.log(bulletItem(`${chalk.bold(dep)} ${chalk.green('removed')}`))
    } catch (err) {
      results.failed.push({ dep, error: err.message })
      console.log(bulletItem(`${chalk.bold(dep)} ${chalk.red('failed:')} ${err.message}`))
    }
  }

  return results
}
