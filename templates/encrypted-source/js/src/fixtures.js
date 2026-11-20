// Public, fixed demo material, never production credentials or fresh nonces.
export const AES_KEY = '00112233445566778899aabbccddeeff'
export const AES_IV = '102132435465768798a9bacbdcedfe0f'
export const XOR_MASK = 90
export const DURATION_MS = 3000

/** Generate a quiet 440 Hz, mono, 16-bit PCM WAV without external assets. */
export function createWav() {
  const sampleRate = 16000
  const samples = (sampleRate * DURATION_MS) / 1000
  const bytes = new Uint8Array(44 + samples * 2)
  const view = new DataView(bytes.buffer)
  const text = (offset, value) => {
    for (let index = 0; index < value.length; index++)
      bytes[offset + index] = value.charCodeAt(index)
  }
  text(0, 'RIFF')
  view.setUint32(4, bytes.length - 8, true)
  text(8, 'WAVE')
  text(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  text(36, 'data')
  view.setUint32(40, samples * 2, true)
  for (let index = 0; index < samples; index++) {
    const fade = Math.min(1, index / 320, (samples - 1 - index) / 320)
    view.setInt16(
      44 + index * 2,
      Math.round(Math.sin((index * 2 * Math.PI * 440) / sampleRate) * 3000 * fade),
      true,
    )
  }
  return bytes
}

async function through(bytes, stream) {
  const source = new ReadableStream({
    start(controller) {
      controller.enqueue(bytes)
      controller.close()
    },
  })
  return new Uint8Array(await new Response(source.pipeThrough(stream)).arrayBuffer())
}

export async function createFixtures(ctx) {
  const wav = createWav()
  const aes = await through(wav, ctx.crypto.createCipher('aes-128-ctr', AES_KEY, AES_IV))
  // Own-service provider does its decryption here, then serves ordinary audio.
  // Caching this tiny fixture lets all three routes support exact byte ranges.
  const plain = await through(aes, ctx.crypto.createDecipher('aes-128-ctr', AES_KEY, AES_IV))
  const xor = wav.map((byte) => byte ^ XOR_MASK)
  return { aes, xor, plain }
}

/** Single-range GET/HEAD serving for encrypted upstreams and decoded audio. */
export function serveBytes(request, bytes, contentType) {
  const headers = new Headers({
    'content-type': contentType,
    'accept-ranges': 'bytes',
    'cache-control': 'no-store',
  })
  let start = 0
  let end = bytes.length - 1
  const range = request.headers.get('range')
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range)
    if (match && (match[1] || match[2])) {
      start = match[1] ? Number(match[1]) : Math.max(0, bytes.length - Number(match[2]))
      end = match[1] && match[2] ? Math.min(Number(match[2]), end) : end
    }
    if (
      !match ||
      (!match[1] && !match[2]) ||
      (!match[1] && Number(match[2]) <= 0) ||
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start > end ||
      start >= bytes.length
    ) {
      headers.set('content-range', `bytes */${bytes.length}`)
      return new Response(null, { status: 416, headers })
    }
    headers.set('content-range', `bytes ${start}-${end}/${bytes.length}`)
  }
  headers.set('content-length', String(end - start + 1))
  return new Response(request.method === 'HEAD' ? null : bytes.slice(start, end + 1), {
    status: range ? 206 : 200,
    headers,
  })
}

export function createHandler(fixtures) {
  return (request) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(null, { status: 405, headers: { allow: 'GET, HEAD' } })
    }
    switch (new URL(request.url).pathname) {
      case '/aes.wav.enc':
        return serveBytes(request, fixtures.aes, 'application/octet-stream')
      case '/xor.wav.enc':
        return serveBytes(request, fixtures.xor, 'application/octet-stream')
      case '/plain.wav':
        return serveBytes(request, fixtures.plain, 'audio/wav')
      case '/health':
        return new Response(request.method === 'HEAD' ? null : 'encrypted-source ready\n', {
          headers: { 'content-type': 'text/plain', 'cache-control': 'no-store' },
        })
      default:
        return new Response(null, { status: 404 })
    }
  }
}
