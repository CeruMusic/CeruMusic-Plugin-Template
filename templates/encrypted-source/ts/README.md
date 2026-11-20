# encrypted-source / ts

Standalone TypeScript variant of the v3 encrypted-source demo. Three providers implement search, resolve and lyrics: built-in AES-CTR decryption, a worker WASM XOR transform, and ordinary audio from a plugin-owned HTTP server. The generated three-second WAV needs no external media, account or paid API.

Read [DEMO.md](DEMO.md) for the exact API assumptions, permission behavior, offline and desktop verification, and adaptation to real integrations. A copy is included inside this project so CLI scaffolding retains all instructions.

```powershell
node --test tests/demo.test.mjs
```

Requires Node 22.18+. This runs without installing the SDK and does not build anything. After the parent task integrates the matching local v3 SDK/CLI/Host, use `npm run typecheck` and `npm run dev`, then add the printed JS path to the desktop developer mode. Do not validate this in-progress contract against npm `latest`.

Open `ceru-plugin.code-workspace` for the standard VS Code tasks. `ceru.plugin.json` embeds `resources/xor-byte.wasm` as base64 and declares `network.serve` plus optional `streams.transform`. No configuration or credentials are necessary.
