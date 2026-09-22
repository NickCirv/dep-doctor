import { execFileSync } from 'node:child_process'

export function readNpmJson(command, cwd) {
  let output
  try {
    output = execFileSync('npm', [command, '--json'], {
      cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    })
  } catch (error) {
    // npm uses exit 1 for findings; transport/process failures are not a clean result.
    if (error.status !== 1 || !error.stdout) throw new Error(`npm ${command} failed`)
    output = error.stdout
  }
  let data
  try { data = JSON.parse(output) } catch { throw new Error(`npm ${command} returned invalid JSON`) }
  if (!data || typeof data !== 'object' || Array.isArray(data) || data.error)
    throw new Error(`npm ${command} did not return a usable report`)
  if (command === 'audit' && (!data.vulnerabilities || typeof data.vulnerabilities !== 'object'))
    throw new Error('npm audit report is missing vulnerability data')
  return data
}
