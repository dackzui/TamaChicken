import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const bump = process.argv[2] ?? 'patch'
if (!['patch', 'minor', 'major'].includes(bump)) {
  console.error('Usage: node scripts/bump-version.mjs [patch|minor|major]')
  process.exit(1)
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkgPath = resolve(root, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

const parts = pkg.version.split('.').map((n) => Number(n))
if (bump === 'major') {
  parts[0] += 1
  parts[1] = 0
  parts[2] = 0
} else if (bump === 'minor') {
  parts[1] += 1
  parts[2] = 0
} else {
  parts[2] += 1
}

pkg.version = parts.join('.')
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

const lockPath = resolve(root, 'package-lock.json')
try {
  const lock = JSON.parse(readFileSync(lockPath, 'utf-8'))
  lock.version = pkg.version
  if (lock.packages?.['']) {
    lock.packages[''].version = pkg.version
  }
  writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`)
} catch {
  // lockfile optional during early setup
}

console.log(`version -> ${pkg.version}`)

spawnSync(process.execPath, [resolve(root, 'scripts/sync-native-version.mjs')], {
  stdio: 'inherit',
})
