import { readdir, readFile, lstat, realpath, writeFile } from 'node:fs/promises'
import { resolve, join, relative, sep, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
const issuer = await import(process.env.CERU_ISSUER_MODULE || '@shiqianjiang/ceru-plugin-issuer')
const { sniffManifestVersion, validateManifest, parseJsonStrict } = issuer
const legacy = await import(process.env.CERU_V2_ISSUER_MODULE || 'ceru-plugin-issuer-v2')
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
for (const entry of await readdir(join(root, 'templates'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const name = entry.name
  for (const language of ['ts', 'js']) {
    const dir = join(root, 'templates', name, language)
    const config = await json(join(dir, 'ceru.plugin.json'))
    validateManifest(config.manifest)
    const pkg = await json(join(dir, 'package.json'))
    if (!pkg.private) throw new Error('Template package must default to private')
    if (pkg.scripts?.preview !== 'ceru-plugin preview ' + (config.output ?? 'dist/plugin.js'))
      throw new Error(name + '/' + language + ': preview must check the built artifact for desktop use')
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
const pluginRoot = join(root, 'plugins')
const submissions = []
for (const item of await readdir(pluginRoot, { withFileTypes: true })) {
  if (item.isDirectory() && !['v2', 'v3'].includes(item.name))
    throw new Error('Plugin submissions must be stored under plugins/v2 or plugins/v3')
}
for (const apiVersion of [2, 3]) {
  const versionRoot = join(pluginRoot, 'v' + apiVersion)
  for (const item of await readdir(versionRoot, { withFileTypes: true }).catch(() => [])) {
    if (item.isDirectory())
      submissions.push({
        id: item.name,
        dir: join(versionRoot, item.name),
        expectedApiVersion: apiVersion,
      })
  }
}
for (const submission of submissions) {
  const { dir, id } = submission
  const meta = await json(join(dir, 'plugin.json'))
  if (!safeId.test(meta.id) || id !== meta.id)
    throw new Error('Plugin directory must match its stable id')
  for (const key of ['name', 'version', 'description', 'author', 'license', 'source'])
    if (typeof meta[key] !== 'string' || !meta[key])
      throw new Error('Missing plugin metadata: ' + key)
  const source = new URL(meta.source)
  if (source.protocol !== 'https:' || source.username || source.password)
    throw new Error('Source URL must be HTTPS without credentials')
  if (meta.sourceCode) {
    const sourceCode = new URL(meta.sourceCode)
    if (sourceCode.protocol !== 'https:' || sourceCode.username || sourceCode.password)
      throw new Error('Source code URL must be HTTPS without credentials')
  }
  if (!!meta.entry === !!meta.download) throw new Error('Choose entry or download, not both')
  let apiVersion
  let sha256
  if (meta.entry) {
    if (!/\.js$/.test(meta.entry)) throw new Error('Plugin entry must be .js')
    const file = await localFile(dir, meta.entry),
      bytes = await readFile(file)
    const artifact = (sniffManifestVersion(bytes) === 2 ? legacy : issuer).readArtifact(bytes)
    apiVersion = artifact.header.manifest.manifestVersion
    if (submission.expectedApiVersion && apiVersion !== submission.expectedApiVersion)
      throw new Error('Plugin artifact does not match its version directory: ' + id)
    sha256 = createHash('sha256').update(bytes).digest('hex')
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
    if (![2, 3].includes(meta.apiVersion) || meta.apiVersion !== submission.expectedApiVersion)
      throw new Error('Remote record apiVersion must match its version directory')
    apiVersion = meta.apiVersion
    sha256 = meta.sha256
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
  plugins.push({
    ...meta,
    apiVersion,
    download:
      meta.download ||
      'https://raw.githubusercontent.com/CeruMusic/CeruMusic-Plugin-Template/main/plugins/' +
        relative(pluginRoot, dir).split(sep).join('/') +
        '/' +
        meta.entry,
    sha256,
  })
}
plugins.sort((a, b) => a.id.localeCompare(b.id) || a.apiVersion - b.apiVersion)
const indexes = new Map([
  ['index.json', plugins],
  ['index.v2.json', plugins.filter((plugin) => plugin.apiVersion === 2)],
  ['index.v3.json', plugins.filter((plugin) => plugin.apiVersion === 3)],
])
for (const [filename, entries] of indexes) {
  const path = join(root, 'plugins', filename)
  const contents = JSON.stringify({ schemaVersion: 1, plugins: entries }, null, 2) + '\n'
  if (process.argv.includes('--write-index')) await writeFile(path, contents)
  else if ((await readFile(path, 'utf8').catch(() => '')) !== contents)
    throw new Error('Plugin index is out of date. Run npm test -- --write-index and commit the generated indexes.')
}
console.log(
  'Validated ' +
    templates +
    ' template variants and ' +
    plugins.length +
    ' plugin submissions without executing their code.',
)
