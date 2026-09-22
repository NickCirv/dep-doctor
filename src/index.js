import { Command } from 'commander'
import { resolve } from 'node:path'
import { scanProject } from './scanner.js'
import { runSecurityScan } from './security.js'
import { parseOutdated } from './outdated.js'
import { fixSafeUpdates, removeUnusedDeps } from './fixer.js'
import { printFullReport, printScanSummary } from './reporter.js'

// Dependency injection keeps dispatch tests offline without replacing real adapters.
export async function run(argv = process.argv, overrides = {}) {
  const services = { scanProject, runSecurityScan, parseOutdated, fixSafeUpdates,
    removeUnusedDeps, printFullReport, printScanSummary, ...overrides }
  const program = new Command()
    .name('dep-doctor').description('Inspect npm dependencies; apply changes only with fix --yes')
    .version('1.0.0').option('--cwd <directory>', 'Project directory', '.')
    .allowExcessArguments(false).exitOverride()
  async function inspect(command, mode) {
    const cwd = resolve(command.optsWithGlobals().cwd)
    const scan = await services.scanProject(cwd)
    if (mode === 'scan') services.printScanSummary(scan)
    else {
      const security = await services.runSecurityScan(cwd)
      services.printFullReport(scan, security.raw)
    }
  }
  program.action(async (_opts, command) => inspect(command, 'report'))
  program.command('scan').description('Inspect outdated, potentially unused and duplicate dependencies')
    .action(async (_opts, command) => inspect(command, 'scan'))
  program.command('report').description('Include npm audit results in the dependency report')
    .action(async (_opts, command) => inspect(command, 'report'))
  program.command('fix').description('Explicitly update dependencies within declared ranges')
    .option('--yes', 'Authorize npm update')
    .option('--remove-unused', 'Also authorize removal of heuristically unused dependencies')
    .action(async (opts, command) => {
      if (!opts.yes) throw new Error('fix requires --yes; inspect a report before authorizing changes')
      const cwd = resolve(command.optsWithGlobals().cwd)
      const scan = await services.scanProject(cwd)
      const result = await services.fixSafeUpdates(services.parseOutdated(scan.outdatedRaw), cwd)
      if (result.failed.length) throw new Error('One or more dependency updates failed')
      if (opts.removeUnused) {
        const removed = await services.removeUnusedDeps(scan.unused, cwd)
        if (removed.failed.length) throw new Error('One or more dependency removals failed')
      }
    })
  try {
    await program.parseAsync(argv)
    return 0
  } catch (error) {
    if (error.code === 'commander.helpDisplayed' || error.code === 'commander.version') return 0
    if (!error.code?.startsWith('commander.')) console.error(`dep-doctor: ${error.message}`)
    return 1
  }
}
