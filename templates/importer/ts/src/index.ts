import { definePlugin } from '@shiqianjiang/ceru-plugin-sdk'

export default definePlugin(async (ctx) => {
  await ctx.ui.setState('settings', {
    titles: 'Morning Light, Night Walk, Morning Light',
    preview: '尚未生成预览',
  })
  ctx.actions.register('hello', () => ctx.ui.openView('settings'))

  ctx.actions.register('import.prepare', async (input) => {
    const text =
      input &&
      typeof input === 'object' &&
      !Array.isArray(input) &&
      typeof input.titles === 'string'
        ? input.titles
        : ''
    const titles = ctx.utils.lodash.uniq(
      text
        .split(/[,，\n]+/)
        .map((title) => title.trim())
        .filter(Boolean),
    )
    const plan = {
      status: 'preview',
      operation: 'append',
      items: titles.map((title) => ({ title })),
    }

    // 这里只生成计划。真正写入歌单前，还需要 Host 批准目标和写入范围。
    await ctx.ui.setState('settings', {
      titles: text,
      preview: '去重后共 ' + titles.length + ' 首：' + titles.join(' / '),
    })
    return plan
  })
})
