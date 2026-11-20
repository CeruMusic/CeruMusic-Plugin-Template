import type {
  PluginContext,
  ResourceRef,
  ResolveResult,
  ServerHandle,
  StreamTransformFactory,
  UserIntentHandle,
} from '@shiqianjiang/ceru-plugin-sdk'
import {
  AES_KEY,
  AES_IV,
  XOR_MASK,
  DURATION_MS,
  createFixtures,
  createHandler,
} from './fixtures.ts'

export const PROVIDERS = [
  { id: 'builtin-decrypt', title: 'Encrypted Demo / AES-CTR', path: '/aes.wav.enc' },
  { id: 'wasm-transform', title: 'Encrypted Demo / WASM XOR', path: '/xor.wav.enc' },
  { id: 'own-service', title: 'Encrypted Demo / Own Service', path: '/plain.wav' },
] as const

// One private WASM instance per media request, including concurrent seeks.
export function createWasmFactory(ctx: Pick<PluginContext, 'wasm'>): StreamTransformFactory {
  return {
    // XOR is length preserving and independent of the starting byte offset.
    seekable: true,
    async create({ signal }) {
      signal?.throwIfAborted()
      const { instance } = await ctx.wasm.instantiate('xor-byte')
      const decode = instance.exports.decode
      if (typeof decode !== 'function')
        throw new Error('xor-byte.wasm must export decode(i32, i32) -> i32')
      return {
        transform(chunk) {
          signal?.throwIfAborted()
          const output = new Uint8Array(chunk.length)
          for (let index = 0; index < chunk.length; index++)
            output[index] = decode(chunk[index], XOR_MASK)
          return output
        },
      }
    },
  }
}

class PermissionRequired extends Error {}

export function installDemo(ctx: PluginContext): void {
  let server: ServerHandle | undefined
  let starting: Promise<ServerHandle> | undefined
  let disposed = false
  ctx.effects.add(ctx.streams.registerTransform('xor-byte', createWasmFactory(ctx)))
  ctx.effects.add(async () => {
    disposed = true
    const active = server ?? (await starting?.catch(() => undefined))
    await active?.close()
    server = undefined
  })

  async function requireGrant(
    key: string,
    group: 'localServer' | 'audioTransform',
    intent?: UserIntentHandle,
  ) {
    let { status } = await ctx.permissions.query({ key })
    if (status !== 'granted')
      ({ status } = await ctx.permissions.requestGroup({ group, keys: [key], intent }))
    if (status !== 'granted')
      throw new PermissionRequired(
        `权限 ${key} 当前为 ${status}。请运行“启动本地音频 Demo”，允许对应权限后重试。`,
      )
  }

  async function ensureServer(intent?: UserIntentHandle): Promise<ServerHandle> {
    if (disposed) throw new Error('插件正在停止')
    await requireGrant('demo-server', 'localServer', intent)
    if (server) return server
    if (!starting) {
      starting = (async () => {
        const fixtures = await createFixtures(ctx)
        if (disposed) throw new Error('插件正在停止')
        const active = await ctx.server.serve(createHandler(fixtures), {
          permissionKey: 'demo-server',
        })
        if (disposed) {
          await active.close()
          throw new Error('插件正在停止')
        }
        server = active
        ctx.log.info(`Encrypted demo listening: ${active.url} (${fixtures.plain.length} WAV bytes)`)
        return active
      })().finally(() => {
        starting = undefined
      })
    }
    return starting
  }

  ctx.actions.register('demo.start', async (_input, operation) => {
    try {
      const local = await ctx.permissions.requestGroup({
        group: 'localServer',
        keys: ['demo-server'],
        intent: operation.userIntent,
      })
      if (local.status !== 'granted')
        throw new PermissionRequired(`本机服务权限为 ${local.status}；三个 Demo 均需要它。`)
      const active = await ensureServer(operation.userIntent)
      await ctx.ui.notify({
        key: 'encrypted-demo',
        level: 'info',
        message: `本地音频 Demo：${active.url}。搜索 Encrypted Demo。AES-CTR 与 Own Service 已就绪；首次播放 WASM XOR 时会申请音频流处理权限。`,
      })
    } catch (error) {
      await ctx.ui.notify({
        key: 'encrypted-demo',
        level: 'error',
        message: error instanceof Error ? error.message : String(error),
      })
    }
  })

  for (const provider of PROVIDERS) {
    const matches = (ref: ResourceRef) =>
      ref.kind === 'track' &&
      ref.id === 'tone-440' &&
      ref.providerId === provider.id &&
      (!ref.pluginId || ref.pluginId === ctx.plugin.id)
    ctx.providers.register(provider.id, {
      tracks: {
        async search(request) {
          const query = request.query.trim().toLowerCase()
          if (
            request.cursor ||
            !`${provider.title} Ceru Demo 440`.toLowerCase().includes(query) ||
            request.limit <= 0
          )
            return { items: [] }
          return {
            items: [
              {
                ref: {
                  pluginId: ctx.plugin.id,
                  providerId: provider.id,
                  kind: 'track',
                  id: 'tone-440',
                },
                title: provider.title,
                subtitle: 'Ceru Demo · 440 Hz · 3 seconds',
                playable: true,
                capabilities: ['play'],
                durationMs: DURATION_MS,
                metadata: { artists: ['Ceru Demo'] },
              },
            ],
          }
        },
        async resolve(ref, _quality, operation): Promise<ResolveResult> {
          if (!matches(ref))
            return ctx.playback.failure({ code: 'NOT_FOUND', message: '没有这条演示音频。' })
          try {
            if (provider.id === 'wasm-transform')
              await requireGrant('demo-transform', 'audioTransform', operation.userIntent)
            const active = await ensureServer(operation.userIntent)
            const url = new URL(provider.path, active.url).href
            const metadata = { contentType: 'audio/wav', contentLength: 96044 }
            if (provider.id === 'builtin-decrypt')
              return {
                ok: true,
                url,
                stream: {
                  ...metadata,
                  decrypt: { algorithm: 'aes-128-ctr', key: AES_KEY, iv: AES_IV, encoding: 'hex' },
                },
              }
            if (provider.id === 'wasm-transform')
              return { ok: true, url, stream: { ...metadata, transform: 'xor-byte' } }
            return { ok: true, url }
          } catch (error) {
            return ctx.playback.failure({
              code: error instanceof PermissionRequired ? 'PERMISSION_DENIED' : 'INTERNAL',
              message: error instanceof Error ? error.message : String(error),
              recovery: {
                mode: 'await-user',
                actions: [
                  { kind: 'plugin-command', commandId: 'demo.start', label: '启动本地音频 Demo' },
                ],
              },
            })
          }
        },
        async lyrics(ref) {
          return {
            format: 'crlyric',
            version: 1,
            track: ref,
            offsetMs: 0,
            lines: matches(ref)
              ? [
                  { startTimeMs: 0, text: provider.title },
                  { startTimeMs: 1000, text: '440 Hz 合成纯音，无人声；此处是演示歌词。' },
                  { startTimeMs: 2000, text: '本地生成 · 无需账号或付费 API' },
                ]
              : [],
          }
        },
      },
    })
  }
}
