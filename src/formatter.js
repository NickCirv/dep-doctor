import chalk from 'chalk'

export const SEVERITY_COLORS = {
  critical: chalk.bgRed.bold,
  high: chalk.red.bold,
  moderate: chalk.yellow.bold,
  medium: chalk.yellow.bold,
  low: chalk.blue,
  info: chalk.gray,
}

export const SEVERITY_BADGES = {
  critical: chalk.bgRed.bold(' CRIT '),
  high: chalk.bgRed(' HIGH '),
  moderate: chalk.bgYellow.black(' MOD  '),
  medium: chalk.bgYellow.black(' MED  '),
  low: chalk.bgBlue(' LOW  '),
  info: chalk.bgGray(' INFO '),
}

export const UPDATE_BADGES = {
  patch: chalk.bgGreen.black(' PATCH '),
  minor: chalk.bgYellow.black(' MINOR '),
  major: chalk.bgRed.white(' MAJOR '),
}

export const GRADE_COLORS = {
  A: chalk.green.bold,
  B: chalk.greenBright.bold,
  C: chalk.yellow.bold,
  D: chalk.redBright.bold,
  F: chalk.bgRed.bold,
}

export function severityBadge(severity) {
  const key = severity.toLowerCase()
  return SEVERITY_BADGES[key] || chalk.gray(` ${severity.toUpperCase()} `)
}

export function updateBadge(type) {
  const key = type.toLowerCase()
  return UPDATE_BADGES[key] || chalk.gray(` ${type.toUpperCase()} `)
}

export function progressBar(value, max, width = 30) {
  const filled = Math.round((value / max) * width)
  const empty = width - filled
  const bar = chalk.hex('#8B5CF6')('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
  return `[${bar}]`
}

export function scoreBar(score, width = 20) {
  const filled = Math.round((score / 100) * width)
  const empty = width - filled
  let barColor
  if (score >= 80) barColor = chalk.green
  else if (score >= 60) barColor = chalk.yellow
  else if (score >= 40) barColor = chalk.redBright
  else barColor = chalk.red

  const bar = barColor('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
  return `[${bar}]`
}

export function divider(width = 60, char = '─') {
  return chalk.gray(char.repeat(width))
}

export function header(text) {
  const line = chalk.hex('#8B5CF6')('▌')
  return `${line} ${chalk.bold(text)}`
}

export function subheader(text) {
  return chalk.gray(`  ${text}`)
}

export function tableRow(label, value, width = 28) {
  const padded = label.padEnd(width)
  return `  ${chalk.gray(padded)}${value}`
}

export function bulletItem(text, indent = 2) {
  const space = ' '.repeat(indent)
  return `${space}${chalk.hex('#8B5CF6')('•')} ${text}`
}

export function gradeBadge(grade) {
  const color = GRADE_COLORS[grade] || chalk.gray.bold
  return color(` ${grade} `)
}

export function countBadge(count, thresholds = { warn: 1, error: 5 }) {
  if (count === 0) return chalk.green.bold(count)
  if (count <= thresholds.warn) return chalk.yellow.bold(count)
  if (count <= thresholds.error) return chalk.redBright.bold(count)
  return chalk.red.bold(count)
}
