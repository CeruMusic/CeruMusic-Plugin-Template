import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createCipheriv, createDecipheriv } from 'node:crypto'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { installDemo, createWasmFactory, PROVIDERS } from '../src/demo.ts'
import {
  AES_KEY,
  AES_IV,
  XOR_MASK,
  createWav,
  createFixtures,
  createHandler,
} from '../src/fixtures.ts'

// These adapters test plugin logic with real crypto, WASM and loopback HTTP.
// They do not replace verification in a Ceru desktop worker/permission bridge.
function cipher(mode, algorithm, key, iv) {
  const instance = (mode === 'encrypt' ? createCipheriv : createDecipheriv)(
    algorithm,
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex'),
  )
  return new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(new Uint8Array(instance.update(chunk)))
    },
    flush(controller) {
      controller.enqueue(new Uint8Array(instance.final()))
    },
  })
}

function harness(t, { local = 'granted', audio = 'granted', failStart = false, beforeServe } = {}) {
  const grants = new Map()
  const prompts = []
  const providers = new Map()
  const actions = new Map()
  const transforms = new Map()
  const effects = []
  const notifications = []
  const handles = []
  let starts = 0
  const ctx = {
    plugin: { id: 'local.encrypted-test' },
    crypto: {
      createCipher: (...args) => cipher('encrypt', ...args),
      createDecipher: (...args) => cipher('decrypt', ...args),
    },
    wasm: {
      async instantiate(id) {
        assert.equal(id, 'xor-byte')
        return WebAssembly.instantiate(
          await readFile(new URL('../resources/xor-byte.wasm', import.meta.url)),
        )
      },
    },
    streams: {
      registerTransform(id, factory) {
        transforms.set(id, factory)
        return () => {
          transforms.delete(id)
        }
      },
    },
    effects: {
      add(dispose) {
        effects.push(dispose)
      },
    },
    permissions: {
      async query({ key }) {
        return { status: grants.get(key) ?? 'prompt' }
      },
      async requestGroup(request) {
        prompts.push(request)
        const status = request.group === 'localServer' ? local : audio
        for (const key of request.keys) grants.set(key, status)
        return { group: request.group, status, grants: [] }
      },
    },
    actions: {
      register(id, action) {
        actions.set(id, action)
      },
    },
    providers: {
      register(id, provider) {
        providers.set(id, provider)
      },
    },
    ui: {
      async notify(value) {
        notifications.push(value)
      },
    },
    playback: {
      failure(error) {
        return { ok: false, error }
      },
    },
    log: { info() {} },
    server: {
      async serve(handler, options) {
        starts++
        assert.deepEqual(options, { permissionKey: 'demo-server' })
        assert.equal(grants.get('demo-server'), 'granted')
        if (failStart && starts === 1) throw new Error('Simulated occupied listener')
        await beforeServe?.()
        const listener = createServer((incoming, outgoing) => {
          Promise.resolve(
            handler(
              new Request(`http://127.0.0.1${incoming.url}`, {
                method: incoming.method,
                headers: incoming.headers,
              }),
            ),
          )
            .then(async (response) => {
              outgoing.writeHead(response.status, Object.fromEntries(response.headers))
              outgoing.end(Buffer.from(await response.arrayBuffer()))
            })
            .catch((error) => {
              outgoing.writeHead(500)
              outgoing.end(String(error))
            })
        })
        await new Promise((resolve, reject) => {
          listener.once('error', reject)
          listener.listen(0, '127.0.0.1', resolve)
        })
        let closed = false
        const handle = {
          url: `http://127.0.0.1:${listener.address().port}`,
          port: listener.address().port,
          get closed() {
            return closed
          },
          async close() {
            if (closed) return
            closed = true
            await new Promise((resolve, reject) => {
              listener.close((error) => (error ? reject(error) : resolve()))
              listener.closeAllConnections()
            })
          },
        }
        handles.push(handle)
        return handle
      },
    },
  }
  const dispose = async () => {
    for (const effect of [...effects].reverse()) await effect()
  }
  t.after(dispose)
  installDemo(ctx)
  return {
    ctx,
    grants,
    prompts,
    providers,
    actions,
    transforms,
    notifications,
    handles,
    dispose,
    get starts() {
      return starts
    },
  }
}

const operation = { userIntent: { kind: 'user-intent', id: 'test-click' } }
const ref = (id) => ({
  pluginId: 'local.encrypted-test',
  providerId: id,
  kind: 'track',
  id: 'tone-440',
})
const resolve = (h, id) => h.providers.get(id).tracks.resolve(ref(id), undefined, operation)
const bytes = async (response) => new Uint8Array(await response.arrayBuffer())

test('AES fixture roundtrip, WAV structure, WASM byte transform and concurrent offsets', async (t) => {
  const h = harness(t)
  const wav = createWav()
  assert.equal(wav.length, 96044)
  assert.equal(Buffer.from(wav.subarray(0, 4)).toString(), 'RIFF')
  const view = new DataView(wav.buffer)
  assert.equal(view.getUint32(4, true) + 8, wav.length)
  assert.equal(view.getUint32(24, true), 16000)
  assert.equal(view.getUint16(34, true), 16)
  const fixture = await createFixtures(h.ctx)
  assert.deepEqual(fixture.plain, wav)
  assert.notDeepEqual(fixture.aes, wav)
  assert.notDeepEqual(fixture.xor, wav)
  const factory = createWasmFactory(h.ctx)
  const controller = new AbortController()
  const first = await factory.create({ offset: 0, signal: controller.signal })
  const second = await factory.create({ offset: 37 })
  assert.deepEqual(await first.transform(fixture.xor.subarray(0, 37)), wav.subarray(0, 37))
  assert.deepEqual(await second.transform(fixture.xor.subarray(37)), wav.subarray(37))
  const allBytes = Uint8Array.from({ length: 256 }, (_, index) => index)
  assert.deepEqual(
    await first.transform(allBytes),
    allBytes.map((byte) => byte ^ XOR_MASK),
  )
  controller.abort()
  assert.throws(() => first.transform(fixture.xor), /abort/i)
})

test('Web handler supports HEAD, exact, open, suffix and invalid byte ranges', async (t) => {
  const h = harness(t)
  const fixture = await createFixtures(h.ctx)
  const handler = createHandler(fixture)
  for (const [path, data] of [
    ['/plain.wav', fixture.plain],
    ['/aes.wav.enc', fixture.aes],
    ['/xor.wav.enc', fixture.xor],
  ]) {
    for (const [range, start, end] of [
      ['bytes=17-42', 17, 42],
      ['bytes=96000-', 96000, 96043],
      ['bytes=-31', 96013, 96043],
      ['bytes=0-999999', 0, 96043],
    ]) {
      const response = handler(new Request('http://local' + path, { headers: { range } }))
      assert.equal(response.status, 206)
      assert.equal(response.headers.get('content-range'), `bytes ${start}-${end}/96044`)
      assert.deepEqual(await bytes(response), data.slice(start, end + 1))
    }
    const head = handler(new Request('http://local' + path, { method: 'HEAD' }))
    assert.equal(head.headers.get('content-length'), '96044')
    assert.equal((await head.arrayBuffer()).byteLength, 0)
    for (const range of [
      'bytes=-0',
      'bytes=9-3',
      'bytes=96044-',
      'bytes=0-1,4-5',
      'bytes=-',
      'garbage',
    ]) {
      assert.equal(handler(new Request('http://local' + path, { headers: { range } })).status, 416)
    }
  }
  assert.equal(handler(new Request('http://local/missing')).status, 404)
  assert.equal(handler(new Request('http://local/plain.wav', { method: 'POST' })).status, 405)
})

test('search/lyrics need no grants or listener, refs and paging stay provider scoped', async (t) => {
  const h = harness(t)
  assert.equal(h.providers.size, 3)
  for (const { id } of PROVIDERS) {
    const tracks = h.providers.get(id).tracks
    const page = await tracks.search({ query: 'ENCRYPTED demo', limit: 10 })
    assert.deepEqual(page.items[0].ref, ref(id))
    assert.equal(page.items[0].durationMs, 3000)
    assert.equal((await tracks.search({ query: 'unrelated', limit: 10 })).items.length, 0)
    assert.equal((await tracks.search({ query: '', limit: 10, cursor: 'done' })).items.length, 0)
    assert.equal((await tracks.lyrics(ref(id))).lines.length, 3)
    assert.equal(
      (await tracks.resolve({ ...ref(id), id: 'unknown' }, undefined, operation)).error.code,
      'NOT_FOUND',
    )
    assert.equal(
      (await tracks.resolve(ref('other-provider'), undefined, operation)).error.code,
      'NOT_FOUND',
    )
  }
  assert.equal(h.prompts.length, 0)
  assert.equal(h.starts, 0)
})

test('three provider URLs play identical bytes using one real loopback listener', async (t) => {
  const h = harness(t)
  const results = await Promise.all(PROVIDERS.map(({ id }) => resolve(h, id)))
  assert.equal(h.starts, 1)
  for (const result of results) {
    assert.equal(result.ok, true)
    const response = await fetch(result.url)
    assert.equal(response.status, 200)
    let decoded = await bytes(response)
    if (result.stream?.decrypt) {
      const decoder = createDecipheriv(
        'aes-128-ctr',
        Buffer.from(AES_KEY, 'hex'),
        Buffer.from(AES_IV, 'hex'),
      )
      decoded = new Uint8Array(Buffer.concat([decoder.update(decoded), decoder.final()]))
    } else if (result.stream?.transform) {
      const transform = await h.transforms.get(result.stream.transform).create({ offset: 0 })
      decoded = await transform.transform(decoded)
    }
    assert.deepEqual(decoded, createWav())
    const range = await fetch(result.url, { headers: { Range: 'bytes=32-63' } })
    assert.equal(range.status, 206)
    assert.equal((await range.arrayBuffer()).byteLength, 32)
  }
  assert.equal(results[2].stream, undefined)
  assert.ok(h.prompts.every((prompt) => prompt.intent === operation.userIntent))
  await h.dispose()
  assert.equal(h.transforms.size, 0)
  assert.equal(h.handles[0].closed, true)
})

test('denied transform only blocks WASM; built-in decrypt and own service still work', async (t) => {
  const h = harness(t, { audio: 'denied' })
  const wasm = await resolve(h, 'wasm-transform')
  assert.equal(wasm.error.code, 'PERMISSION_DENIED')
  assert.match(wasm.error.message, /denied/)
  assert.equal(wasm.error.recovery.actions[0].commandId, 'demo.start')
  assert.equal(h.starts, 0)
  assert.equal((await resolve(h, 'builtin-decrypt')).ok, true)
  assert.equal((await resolve(h, 'own-service')).ok, true)
  assert.equal(h.starts, 1)
})

test('denied server permission blocks every provider and start action explains it', async (t) => {
  const h = harness(t, { local: 'denied' })
  for (const { id } of PROVIDERS)
    assert.equal((await resolve(h, id)).error.code, 'PERMISSION_DENIED')
  await h.actions.get('demo.start')(null, operation)
  assert.equal(h.notifications.at(-1).level, 'error')
  assert.match(h.notifications.at(-1).message, /denied/)
  assert.equal(h.starts, 0)
})

test('server start failure is actionable and the next resolve retries', async (t) => {
  const h = harness(t, { failStart: true })
  assert.equal((await resolve(h, 'own-service')).error.code, 'INTERNAL')
  assert.equal((await resolve(h, 'own-service')).ok, true)
  assert.equal(h.starts, 2)
})

test('unload during server startup closes the late listener', async (t) => {
  let release
  let entered
  const atServe = new Promise((resolve) => {
    entered = resolve
  })
  const gate = new Promise((resolve) => {
    release = resolve
  })
  const h = harness(t, {
    beforeServe: async () => {
      entered()
      await gate
    },
  })
  const pending = resolve(h, 'own-service')
  await atServe
  const stopping = h.dispose()
  release()
  assert.equal((await pending).error.code, 'INTERNAL')
  await stopping
  assert.equal(h.handles[0].closed, true)
})
