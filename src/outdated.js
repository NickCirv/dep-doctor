import semver from 'semver'

function classifyUpdate(current, wanted, latest) {
  if (!current || !wanted || !latest) return 'unknown'

  const cleanCurrent = semver.coerce(current)?.version
  const cleanLatest = semver.coerce(latest)?.version

  if (!cleanCurrent || !cleanLatest) return 'unknown'

  try {
    const diff = semver.diff(cleanCurrent, cleanLatest)
    if (!diff) return 'current'
    if (diff === 'patch' || diff === 'prepatch' || diff === 'prerelease') return 'patch'
    if (diff === 'minor' || diff === 'preminor') return 'minor'
    if (diff === 'major' || diff === 'premajor') return 'major'
    return 'unknown'
  } catch {
    return 'unknown'
  }
}

export function parseOutdated(outdatedRaw) {
  const patch = []
  const minor = []
  const major = []
  const unknown = []

  for (const [name, info] of Object.entries(outdatedRaw)) {
    const entry = {
      name,
      current: info.current || 'N/A',
      wanted: info.wanted || 'N/A',
      latest: info.latest || 'N/A',
      type: info.type || 'dependencies',
      location: info.location || '',
    }

    const updateType = classifyUpdate(info.current, info.wanted, info.latest)
    entry.updateType = updateType

    if (updateType === 'patch') patch.push(entry)
    else if (updateType === 'minor') minor.push(entry)
    else if (updateType === 'major') major.push(entry)
    else unknown.push(entry)
  }

  return { patch, minor, major, unknown }
}

export async function getOutdatedReport(outdatedRaw) {
  const categorized = parseOutdated(outdatedRaw)
  const total =
    categorized.patch.length +
    categorized.minor.length +
    categorized.major.length +
    categorized.unknown.length

  return {
    ...categorized,
    total,
  }
}
