exports.manifest = {
  manifestVersion: 3,
  id: 'example.handwritten',
  name: '手写单文件示例',
  version: '1.0.0',
  description: '不使用 npm、SDK import 或 CLI 的可见 + 不可见插件',
  engines: {
    hostApi: '^3.0.0',
    logicRuntime: 'ceru-js@1',
  },
  entry: {
    logic: { module: 'logic.main' },
    views: [{ id: 'hello', kind: 'web', module: 'view.hello' }],
  },
  provides: {
    actions: [{ id: 'hello.open', title: '打开示例' }],
  },
  ui: {
    pages: [{ id: 'hello', mount: 'sidebar', group: 'tools', title: '手写示例', view: 'hello' }],
  },
  uses: { permissions: [] },
  dataSchemas: { config: 1, state: 1 },
}

exports.activate = async function (core) {
  const ui = require('@ceru/ui')

  core.effects.add(
    core.actions.register('hello.open', async function () {
      await ui.openView('hello')
    }),
  )
}

exports.surfaces = {
  hello: async function (ui) {
    const title = document.createElement('h2')
    title.textContent = '一个 JS 文件就能开发澜音插件'
    const detail = document.createElement('p')
    detail.textContent = '这个页面运行在隔离 Surface 中，没有使用 CLI 或第三方框架。'
    ui.root.replaceChildren(title, detail)
  },
}

exports.resources = {}
