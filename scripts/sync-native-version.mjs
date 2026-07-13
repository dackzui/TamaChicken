import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'))

const version = pkg.version
const [major, minor, patch] = version.split('.').map((n) => Number(n))
const versionCode = major * 10000 + minor * 100 + patch

function syncAndroid() {
  const gradlePath = resolve(root, 'android/app/build.gradle')
  if (!existsSync(gradlePath)) {
    console.log('skip android: project not found')
    return
  }

  let gradle = readFileSync(gradlePath, 'utf-8')
  gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
  gradle = gradle.replace(/versionName\s+"[^"]+"/, `versionName "${version}"`)
  writeFileSync(gradlePath, gradle)
  console.log(`android -> ${version} (${versionCode})`)
}

function syncIos() {
  const plistPath = resolve(root, 'ios/App/App/Info.plist')
  if (!existsSync(plistPath)) {
    console.log('skip ios: project not found')
    return
  }

  let plist = readFileSync(plistPath, 'utf-8')
  plist = plist.replace(
    /(<key>CFBundleShortVersionString<\/key>\s*<string>)[^<]+(<\/string>)/,
    `$1${version}$2`,
  )
  plist = plist.replace(
    /(<key>CFBundleVersion<\/key>\s*<string>)[^<]+(<\/string>)/,
    `$1${String(versionCode)}$2`,
  )
  writeFileSync(plistPath, plist)
  console.log(`ios -> ${version} (${versionCode})`)
}

syncAndroid()
syncIos()
console.log(`synced native version ${version}`)
