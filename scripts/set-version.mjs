#!/usr/bin/env node
/**
 * 统一写入仓库版本号。
 * 用法:
 *   npm run version -- 1.0.6
 *   npm run version -- patch | minor | major
 *
 * versionCode = major * 10000 + minor * 100 + patch  （1.0.5 → 10005）
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SEMVER = /^v?(\d+)\.(\d+)\.(\d+)$/

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content)
}

function rel(filePath) {
  return path.relative(rootDir, filePath).replaceAll('\\', '/')
}

function applyReplace(filePath, pattern, replacement, label) {
  const original = readText(filePath)
  const probe = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`)
  if (!probe.test(original)) {
    throw new Error(`未在 ${rel(filePath)} 中匹配到 ${label}`)
  }
  const next = original.replace(pattern, replacement)
  if (next !== original) {
    writeText(filePath, next)
  }
  return rel(filePath)
}

function replaceOnce(filePath, pattern, replacement, label) {
  return applyReplace(filePath, pattern, replacement, label)
}

function replaceAll(filePath, pattern, replacement, label) {
  return applyReplace(filePath, pattern, replacement, label)
}

function setJsonVersion(filePath, version) {
  return replaceOnce(filePath, /("version"\s*:\s*")[^"]+(")/, `$1${version}$2`, 'version')
}

function setLockfileVersion(filePath, pkgName, version) {
  const pattern = new RegExp(`("name": "${pkgName}",\\s*"version": ")[^"]+(")`, 'g')
  return replaceAll(filePath, pattern, `$1${version}$2`, `${pkgName} version`)
}

function toVersionCode(version) {
  const match = version.match(SEMVER)
  const [, major, minor, patch] = match
  return Number(major) * 10000 + Number(minor) * 100 + Number(patch)
}

function bump(version, type) {
  const [, majorStr, minorStr, patchStr] = version.match(SEMVER)
  let major = Number(majorStr)
  let minor = Number(minorStr)
  let patch = Number(patchStr)
  if (type === 'major') {
    major += 1
    minor = 0
    patch = 0
  } else if (type === 'minor') {
    minor += 1
    patch = 0
  } else {
    patch += 1
  }
  return `${major}.${minor}.${patch}`
}

function resolveNextVersion(current, input) {
  if (!input) {
    return current
  }
  if (input === 'patch' || input === 'minor' || input === 'major') {
    return bump(current, input)
  }
  const match = input.match(SEMVER)
  if (!match) {
    throw new Error(`无效版本号 "${input}"，请使用 x.y.z 或 patch / minor / major`)
  }
  return `${match[1]}.${match[2]}.${match[3]}`
}

function printUsage(current) {
  console.error(`当前版本: ${current}

用法:
  npm run version -- <x.y.z>
  npm run version -- patch | minor | major`)
}

const rootPkgPath = path.join(rootDir, 'package.json')
const current = JSON.parse(readText(rootPkgPath)).version
const input = process.argv[2]
const isNpmVersionHook = process.env.npm_command === 'version'

if (!input && !isNpmVersionHook) {
  printUsage(current)
  process.exit(1)
}

if (current && !SEMVER.test(current)) {
  throw new Error(`根目录 package.json 的 version "${current}" 不是 x.y.z`)
}

const version = resolveNextVersion(current, input)
const versionCode = toVersionCode(version)
const updated = []

updated.push(setJsonVersion(rootPkgPath, version))
updated.push(setJsonVersion(path.join(rootDir, 'uni-vite/package.json'), version))
updated.push(setLockfileVersion(
  path.join(rootDir, 'uni-vite/package-lock.json'),
  'uni-preset-vue',
  version,
))
updated.push(replaceOnce(
  path.join(rootDir, 'uni-vite/src/manifest.json'),
  /("versionName"\s*:\s*")[^"]+(")/,
  `$1${version}$2`,
  'versionName',
))
updated.push(replaceOnce(
  path.join(rootDir, 'uni-vite/src/manifest.json'),
  /("versionCode"\s*:\s*")[^"]+(")/,
  `$1${versionCode}$2`,
  'versionCode',
))

updated.push(setJsonVersion(path.join(rootDir, 'react-native-expo/package.json'), version))
updated.push(setLockfileVersion(
  path.join(rootDir, 'react-native-expo/package-lock.json'),
  'react-native-expo',
  version,
))
updated.push(replaceOnce(
  path.join(rootDir, 'react-native-expo/app.json'),
  /("version"\s*:\s*")[^"]+(")/,
  `$1${version}$2`,
  'expo.version',
))
updated.push(replaceOnce(
  path.join(rootDir, 'react-native-expo/app.json'),
  /("buildNumber"\s*:\s*")[^"]+(")/,
  `$1${versionCode}$2`,
  'ios.buildNumber',
))
updated.push(replaceOnce(
  path.join(rootDir, 'react-native-expo/app.json'),
  /("versionCode"\s*:\s*)\d+/,
  `$1${versionCode}`,
  'android.versionCode',
))

updated.push(replaceOnce(
  path.join(rootDir, 'uni-spring-boot/pom.xml'),
  /(<artifactId>yizhao-spring-boot<\/artifactId>\s*<version>)[^<]+(<\/version>)/,
  `$1${version}$2`,
  'project version',
))
for (const deployFile of [
  'uni-spring-boot/deploy/start.sh',
  'uni-spring-boot/deploy/stop.sh',
  'uni-spring-boot/deploy/deploy-service.sh',
  'uni-spring-boot/deploy/yizhao-app.service',
]) {
  updated.push(replaceAll(
    path.join(rootDir, deployFile),
    /yizhao-spring-boot-\d+\.\d+\.\d+\.jar/g,
    `yizhao-spring-boot-${version}.jar`,
    'jar 文件名',
  ))
}

updated.push(replaceOnce(
  path.join(rootDir, 'uni-android/app/build.gradle'),
  /(versionCode\s+)\d+/,
  `$1${versionCode}`,
  'versionCode',
))
updated.push(replaceOnce(
  path.join(rootDir, 'uni-android/app/build.gradle'),
  /(versionName\s+")[^"]+(")/,
  `$1${version}$2`,
  'versionName',
))

const unique = [...new Set(updated)]
console.log(`版本已更新: ${current} → ${version}  (versionCode ${versionCode})`)
for (const file of unique) {
  console.log(`  - ${file}`)
}
