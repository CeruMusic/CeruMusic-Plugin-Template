# encrypted-source

Three self-contained v3 music providers, in equivalent [JavaScript](js/README.md) and [TypeScript](ts/README.md) projects. Each generates the same quiet three-second 440 Hz PCM WAV, implements search / resolve / lyrics, and needs no external URL, account, paid API, or media download.

| Provider ID       | Resolve result                                              | Where bytes become audio                                                         | Permission                              |
| ----------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------- |
| `builtin-decrypt` | Encrypted URL plus `stream.decrypt` with AES-128-CTR key/IV | Host's built-in media decryption                                                 | `network.serve` for the fixture server  |
| `wasm-transform`  | XOR-encoded URL plus `stream.transform: 'xor-byte'`         | Registered transform in the plugin worker, calling embedded WASM                 | `network.serve` and `streams.transform` |
| `own-service`     | Plain HTTP audio URL, without `stream`                      | Plugin decrypts its fixture through `ctx.crypto.createDecipher`, then serves WAV | `network.serve`                         |

The WASM export is only `decode(byte, mask) = byte XOR mask`. XOR is reversible obfuscation, **not secure encryption**, DRM, a codec, or a commercial music-service implementation. The AES key and IV are intentionally public, fixed demo values. Do not reuse them for real content.

`src/fixtures.*` generates WAV bytes, encrypts them with `ctx.crypto.createCipher`, and roundtrips through `createDecipher`; both crypto methods return Web `TransformStream`s. The tiny plaintext fixture is cached for random-access serving. `src/demo.*` registers providers, manages permissions/listener lifetime, and registers one WASM instance per stream. `resources/xor-byte.wat` is the readable source for the checked-in 44-byte `xor-byte.wasm`.

## Current integration contract

This template targets the in-progress v3 SDK/Host contract. It has not been synced into the CLI template catalogue. The parent task owns listing, snapshot sync, toolchain integration and desktop validation. Do not use published npm `latest` as a substitute for that matching toolchain.

- `ctx.server.serve(handler, options?)` accepts Web `Request` and returns a Web `Response` from the handler. It resolves to `{ url, port, close() }`. The template passes only `{ permissionKey: 'demo-server' }`, leaving the port random and binding to loopback by default. It never requests LAN serving.
- `ctx.permissions.query` and `requestGroup` use the declaration keys `demo-server` / `demo-transform`, groups `localServer` / `audioTransform`, and forward the operation's user intent. No prompt or socket is opened during activation, search, or lyrics. Starting or resolving audio may request a missing grant. Denial returns `PERMISSION_DENIED` with a recovery command.
- The Host requests/enforces `streams.transform` for a custom stream transform. Built-in `stream.decrypt` does **not** need that grant. The template explicitly requests it on WASM resolve so denial is explained before playback.
- `ctx.streams.registerTransform('xor-byte', { seekable, create })` accepts per-request `{ offset, signal }`; `transform(chunk)` returns a fresh `Uint8Array` created in the plugin worker. Bytewise XOR is independent of offset and preserves length, so this particular transform is seekable.
- `ctx.wasm.instantiate('xor-byte')` looks up an embedded resource and returns `{ module, instance }`. The config declares a binary `.wasm` file as `type: 'base64', mime: 'application/wasm'`; the CLI performs the base64 embedding. Do not put a base64 text file at that binary path.
- Resolve metadata's `contentLength: 96044` is the **plaintext** WAV byte count. The fixture happens to have equal plaintext/ciphertext lengths. The Host's owned-loopback-server exception allows these URLs through media preparation. Remote hosts still undergo the normal DNS/network checks.
- `ctx.effects.add` releases the registered transform and closes the owned listener, including when unload races a pending start. The Host also owns ultimate runtime cleanup. Cached URLs expire when the plugin stops; resolve again after a reload.

## Exact offline verification, before SDK sync

From this repository root, with Node **22.18 or newer**:

```powershell
node --test templates/encrypted-source/js/tests/demo.test.mjs templates/encrypted-source/ts/tests/demo.test.mjs
```

This runs 16 checks in total, eight per language. No npm installation, CLI build, template sync, network credentials, or desktop launch is needed. Tests use Node's native TypeScript support for the TS variant.

The harness uses real Node crypto, Web streams, the checked-in WASM binary, and an ephemeral loopback HTTP listener behind small SDK adapters. It verifies WAV headers and exact byte equality, all 256 XOR inputs, split/offset transforms, cancellation, HTTP ranges/HEAD, search/lyrics without prompts, provider/ref isolation, denied grants, shared startup, retry, and unload races. It verifies plugin behavior, **not** the real SDK bridge, worker realm transfer, Host DNS exception, or audible playback.

## Desktop demo, after the parent integrates the matching toolchain

Copy one variant into its own project. For example, from this repository root:

```powershell
Copy-Item -Recurse templates/encrypted-source/ts ../encrypted-source-demo-ts
Set-Location ../encrypted-source-demo-ts
Rename-Item _gitignore .gitignore
node --test tests/demo.test.mjs
```

Use `js` / `encrypted-source-demo-js` for JavaScript. Install the matching local v3 SDK and CLI development packages using the parent task's local-package instructions; `package.json` keeps the same `^3.0.0` dependency convention as the other templates. Once those packages are available in this copied project:

```powershell
npm run typecheck
npm run dev
```

In the v3 desktop app, enable **设置 → 插件管理 → 管理设置 → 插件开发者模式**, then add the JS file printed by `dev`. Open this project's `ceru-plugin.code-workspace` for VS Code F5 support. No second Electron app is launched.

1. Search **Encrypted Demo** in each of **Encrypted Demo / AES-CTR**, **Encrypted Demo / WASM XOR**, and **Encrypted Demo / Own Service**. Each source returns one three-second track. Opening lyrics shows the provider name and two explanatory lines; the tone contains no voice.
2. Select **启动本地音频 Demo** from the plugin commands, or play a track directly. Allow the local-server permission. The notification/log prints the actual random `http://127.0.0.1:<port>` origin. No fixed port is expected.
3. Play AES-CTR and Own Service. Both should play the same quiet tone without asking for audio-transform permission. Play WASM XOR and allow that additional grant; its audio should match.
4. Seek within each track and repeat playback. To see HTTP headers, paste the printed origin into the commands below. `plain.wav` returns `audio/wav`; the encrypted routes return `application/octet-stream` and are only playable through their provider's resolve processing.

```powershell
$DemoOrigin = 'http://127.0.0.1:REPLACE_WITH_PRINTED_PORT'
curl.exe -i "$DemoOrigin/health"
curl.exe -I "$DemoOrigin/plain.wav"
curl.exe -s -D - -H 'Range: bytes=44-75' "$DemoOrigin/plain.wav" -o NUL
curl.exe -s -D - -H 'Range: bytes=32-63' "$DemoOrigin/aes.wav.enc" -o NUL
curl.exe -s -D - -H 'Range: bytes=32-63' "$DemoOrigin/xor.wav.enc" -o NUL
```

Expected: health is `200` with `encrypted-source ready`; HEAD has length `96044`; the three range requests return `206`, length `32`, and the requested `Content-Range`. The handler also supports open-ended and suffix ranges, rejects invalid/multipart ranges with `416`, and accepts only GET/HEAD.

5. Revoke/deny audio-transform permission in the Host. WASM playback must fail with the permission status and recovery action; AES-CTR and Own Service must still work. Deny local-server permission and all three must fail informatively; search/lyrics must remain available. Regrant and retry. Depending on Host grant persistence, clear grants/reload to exercise the initial prompt again.
6. Disable/unload the plugin. The printed URL must stop responding; re-enable and resolve again to obtain the new origin. Test quick reload during startup as well.

Record actual desktop results separately from the offline tests. The template authoring task deliberately does not run SDK sync, build, publish or commit. Once integration is ready, normal release verification is `npm run build`, `npm run validate`, and `npm run preview`; distribute `dist/plugin.js` only.

## Adapting an actual integration

- **Built-in decrypt:** replace the generated fixture URL/key/IV with values from your authorized media API. Return `stream.decrypt` with a supported algorithm and actual key/IV encoding; include the decoded content type and exact decoded length when known. Get fresh URLs on resolve if signed links expire. Authenticate API calls through the Host network/credential APIs and declare the actual domains/scopes. Never log or commit production keys.
- **WASM transform:** replace the tiny module and decoder with your own legitimate format handler. Keep mutable decode state per `create` call, handle cancellation and bounded chunks, and return worker-owned typed arrays. Set `seekable: false` until you can map nonzero byte offsets correctly; XOR's simple offset behavior does not generalize to block encryption, compression, or containers. Native built-in decryption is preferable for supported algorithms.
- **Own service:** replace `createFixtures`/`createHandler` with your upstream-fetch/decrypt/serve pipeline. This demo buffers only 96 KB; real tracks should stream with backpressure/cancellation, correct content headers and byte-range semantics. One plugin owns one listener, so add routes to that server instead of opening one listener per track. Keep loopback binding unless LAN access is explicitly intended and separately declared/granted.
- Keep search metadata and `ResourceRef`s stable, map unknown tracks and upstream errors to structured playback faults, and implement real lyrics. The sample text is intentionally labeled as a demonstration.
- The local fixture server itself does not fetch the network and needs no `network.request` / `network.private` grant. Adding remote API/CDN access requires those declarations and normal Host URL/DNS authorization as applicable. The owned-loopback exception is not a general bypass for arbitrary private-network URLs.
