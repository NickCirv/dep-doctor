import { execFileSync } from 'child_process'
import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

export function readPackageJson(cwd = process.cwd()) {
  const pkgPath = join(cwd, 'package.json')
  if (!existsSync(pkgPath)) {
    throw new Error(`No package.json found in ${cwd}`)
  }
  try {
    return JSON.parse(readFileSync(pkgPath, 'utf8'))
  } catch (err) {
    throw new Error(`Failed to parse package.json: ${err.message}`)
  }
}

export function getDeclaredDeps(pkg) {
  const deps = Object.keys(pkg.dependencies || {})
  const devDeps = Object.keys(pkg.devDependencies || {})
  const peerDeps = Object.keys(pkg.peerDependencies || {})
  const optionalDeps = Object.keys(pkg.optionalDependencies || {})
  return { deps, devDeps, peerDeps, optionalDeps }
}

export function runNpmOutdated(cwd = process.cwd()) {
  try {
    const output = execFileSync('npm', ['outdated', '--json'], {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    return JSON.parse(output || '{}')
  } catch (err) {
    // npm outdated exits with code 1 when packages are outdated — stdout still has JSON
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

export function collectImports(dir, extensions = ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs']) {
  const imports = new Set()

  function walkDir(currentDir) {
    if (!existsSync(currentDir)) return

    let entries
    try {
      entries = readdirSync(currentDir)
    } catch {
      return
    }

    for (const entry of entries) {
      if (entry === 'node_modules' || entry.startsWith('.')) continue

      const fullPath = join(currentDir, entry)
      let stat
      try {
        stat = statSync(fullPath)
      } catch {
        continue
      }

      if (stat.isDirectory()) {
        walkDir(fullPath)
      } else if (extensions.includes(extname(entry))) {
        try {
          const content = readFileSync(fullPath, 'utf8')
          extractImportsFromContent(content, imports)
        } catch {
          // skip unreadable files
        }
      }
    }
  }

  walkDir(dir)
  return imports
}

function extractImportsFromContent(content, imports) {
  // ESM: import x from 'pkg' / import { x } from 'pkg' / import 'pkg'
  const esmRegex = /import\s+(?:[^'"]+\s+from\s+)?['"]([^'"./][^'"]*)['"]/g
  // Dynamic: import('pkg')
  const dynamicRegex = /import\s*\(\s*['"]([^'"./][^'"]*)['"]\s*\)/g
  // CJS: require('pkg')
  const cjsRegex = /require\s*\(\s*['"]([^'"./][^'"]*)['"]\s*\)/g

  for (const regex of [esmRegex, dynamicRegex, cjsRegex]) {
    let match
    while ((match = regex.exec(content)) !== null) {
      const raw = match[1]
      // strip subpath: chalk/something → chalk, @scope/pkg/sub → @scope/pkg
      const pkg = raw.startsWith('@')
        ? raw.split('/').slice(0, 2).join('/')
        : raw.split('/')[0]
      imports.add(pkg)
    }
  }
}

export function detectUnusedDeps(pkg, cwd = process.cwd()) {
  const { deps, devDeps } = getDeclaredDeps(pkg)
  const allDeclared = [...deps, ...devDeps]

  const srcDir = join(cwd, 'src')
  const importsInSrc = collectImports(srcDir)

  // Also scan bin/
  const binDir = join(cwd, 'bin')
  if (existsSync(binDir)) {
    const binImports = collectImports(binDir)
    for (const imp of binImports) importsInSrc.add(imp)
  }

  // Also check root index files
  for (const ext of ['.js', '.ts', '.mjs']) {
    const p = join(cwd, `index${ext}`)
    if (existsSync(p)) {
      try {
        const content = readFileSync(p, 'utf8')
        extractImportsFromContent(content, importsInSrc)
      } catch {
        // ignore
      }
    }
  }

  return allDeclared.filter((dep) => !importsInSrc.has(dep))
}

export function detectDuplicates(cwd = process.cwd()) {
  const lockPath = join(cwd, 'package-lock.json')
  if (!existsSync(lockPath)) return []

  try {
    const lock = JSON.parse(readFileSync(lockPath, 'utf8'))
    const packages = lock.packages || {}
    const versionMap = {}

    for (const [path, info] of Object.entries(packages)) {
      if (!path || !info.version) continue
      const parts = path.split('node_modules/')
      const name = parts[parts.length - 1]
      if (!name || name.startsWith('.')) continue

      if (!versionMap[name]) versionMap[name] = new Set()
      versionMap[name].add(info.version)
    }

    return Object.entries(versionMap)
      .filter(([, versions]) => versions.size > 1)
      .map(([name, versions]) => ({ name, versions: [...versions] }))
  } catch {
    return []
  }
}

export async function scanProject(cwd = process.cwd()) {
  const pkg = readPackageJson(cwd)
  const { deps, devDeps, peerDeps, optionalDeps } = getDeclaredDeps(pkg)
  const outdatedRaw = runNpmOutdated(cwd)
  const unused = detectUnusedDeps(pkg, cwd)
  const duplicates = detectDuplicates(cwd)

  return {
    name: pkg.name || 'unknown',
    version: pkg.version || '0.0.0',
    deps,
    devDeps,
    peerDeps,
    optionalDeps,
    totalDeps: deps.length + devDeps.length,
    outdatedRaw,
    outdatedCount: Object.keys(outdatedRaw).length,
    unused,
    duplicates,
  }
}
