import { execFileSync } from 'child_process'

export function runNpmAudit(cwd = process.cwd()) {
  try {
    const output = execFileSync('npm', ['audit', '--json'], {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    return JSON.parse(output || '{}')
  } catch (err) {
    // npm audit exits with non-zero when vulnerabilities found — stdout has JSON
    if (err.stdout) {
      try {
        return JSON.parse(err.stdout)
      } catch {
        return {}
      }
    }
    return {}
  }
}

export function parseAuditResults(auditData) {
  const summary = {
    critical: 0,
    high: 0,
    moderate: 0,
    medium: 0,
    low: 0,
    info: 0,
    total: 0,
  }

  const vulnerabilities = []

  if (!auditData || typeof auditData !== 'object') {
    return { summary, vulnerabilities }
  }

  // npm audit v2+ format
  const vulns = auditData.vulnerabilities || {}

  for (const [pkgName, vuln] of Object.entries(vulns)) {
    const severity = (vuln.severity || 'info').toLowerCase()
    const normalizedSeverity = severity === 'medium' ? 'moderate' : severity

    if (summary[normalizedSeverity] !== undefined) {
      summary[normalizedSeverity]++
    }
    summary.total++

    const via = Array.isArray(vuln.via)
      ? vuln.via
          .filter((v) => typeof v === 'object')
          .map((v) => ({
            title: v.title || 'Unknown vulnerability',
            url: v.url || '',
            range: v.range || '',
            cvss: v.cvss?.score || null,
          }))
      : []

    vulnerabilities.push({
      package: pkgName,
      severity: normalizedSeverity,
      range: vuln.range || '*',
      fixAvailable: !!vuln.fixAvailable,
      fixedIn: typeof vuln.fixAvailable === 'object' ? vuln.fixAvailable.version : null,
      isDirect: vuln.isDirect || false,
      via,
    })
  }

  // Sort by severity weight
  const severityWeight = { critical: 5, high: 4, moderate: 3, medium: 3, low: 2, info: 1 }
  vulnerabilities.sort(
    (a, b) => (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0),
  )

  return { summary, vulnerabilities }
}

export async function runSecurityScan(cwd = process.cwd()) {
  const auditData = runNpmAudit(cwd)
  const { summary, vulnerabilities } = parseAuditResults(auditData)
  return { summary, vulnerabilities, raw: auditData }
}
