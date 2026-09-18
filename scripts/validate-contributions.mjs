import { readdir, readFile, lstat, realpath, writeFile } from 'node:fs/promises'
import { resolve, join, relative, sep, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
const issuer = await import(process.env.CERU_ISSUER_MODULE || '@shiqianjiang/ceru-plugin-issuer')
const { readArtifact, validateManifest, parseJsonStrict } = issuer
const root = fileURLToPath(new URL('../', import.meta.url))
const safeId = /^[a-z0-9][a-z0-9._-]{2,127}$/
async function json(path) {
  return parseJsonStrict(await readFile(path, 'utf8'))
}
async function localFile(base, file) {
  if (isAbsolute(file) || file.includes('..') || file.includes('\\'))
    throw new Error('Unsafe path: ' + file)
  const path = join(base, file)
  if ((await lstat(path)).isSymbolicLink()) throw new Error('Symlinks are not allowed')
  const actual = await realpath(path),
    rel = relative(await realpath(base), actual)
  if (rel.startsWith('..' + sep) || isAbsolute(rel))
    throw new Error('Path escapes contribution directory')
  return actual
}
let templates = 0
for (const name of await readdir(join(root, 'templates'))) {
  for (const language of ['ts', 'js']) {
    const dir = join(root, 'templates', name, language)
    const config = await json(join(dir, 'ceru.plugin.json'))
    validateManifest(config.manifest)
    const pkg = await json(join(dir, 'package.json'))
    if (!pkg.private) throw new Error('Template package must default to private')
    for (const hook of ['preinstall', 'install', 'postinstall', 'prepublish', 'prepare'])
      if (pkg.scripts?.[hook])
        throw new Error('Automatic install hooks are not accepted in templates')
    for (const file of Object.values(config.entries)) await localFile(dir, file)
    for (const item of Object.values(config.resources || {})) await localFile(dir, item.path)
    for (const folder of Object.values(config.webDist || {}))
      await localFile(dir, folder + '/index.html')
    await readFile(join(dir, 'README.md'))
    templates++
  }
}
const plugins = []
for (const item of await readdir(join(root, 'plugins'), { withFileTypes: true })) {
  if (!item.isDirectory()) continue
  const dir = join(root, 'plugins', item.name),
    meta = await json(join(dir, 'plugin.json'))
  if (!safeId.test(meta.id) || item.name !== meta.id)
    throw new Error('Plugin directory must match its stable id')
  for (const key of ['name', 'version', 'description', 'author', 'license', 'source'])
    if (typeof meta[key] !== 'string' || !meta[key])
      throw new Error('Missing plugin metadata: ' + key)
  const source = new URL(meta.source)
  if (source.protocol !== 'https:' || source.username || source.password)
    throw new Error('Source URL must be HTTPS without credentials')
  if (!!meta.entry === !!meta.download) throw new Error('Choose entry or download, not both')
  if (meta.entry) {
    if (!/\.js$/.test(meta.entry)) throw new Error('Plugin entry must be .js')
    const file = await localFile(dir, meta.entry),
      bytes = await readFile(file)
    const artifact = readArtifact(bytes)
    if (artifact.header.delivery)
      throw new Error('Personalized deliveries must not be submitted publicly')
    if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(bytes.toString('utf8')))
      throw new Error('Private key marker found')
    if (
      artifact.header.manifest.id !== meta.id ||
      artifact.header.manifest.version !== meta.version
    )
      throw new Error('Manifest and catalog metadata differ')
  } else {
    const download = new URL(meta.download)
    if (
      download.protocol !== 'https:' ||
      download.username ||
      download.password ||
      !/^[a-f0-9]{64}$/i.test(meta.sha256 || '')
    )
      throw new Error('Remote record requires HTTPS and a SHA-256')
  }
  await readFile(join(dir, 'README.md'))
  plugins.push(meta)
}
if (process.argv.includes('--write-index'))
  await writeFile(
    join(root, 'plugins/index.json'),
    JSON.stringify({ schemaVersion: 1, plugins }, null, 2) + '\n',
  )
console.log(
  'Validated ' +
    templates +
    ' template variants and ' +
    plugins.length +
    ' plugin submissions without executing their code.',
)
