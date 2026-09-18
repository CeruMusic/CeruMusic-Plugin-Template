import { defineComponent, ref } from 'vue'
export default defineComponent({
  props: { context: { type: Object, required: true } },
  setup(props) {
    const count = ref(0)
    return () => (
      <main style={{ padding: '28px', fontFamily: 'system-ui' }}>
        <h1>Vue TSX 插件页面</h1>
        <p>{props.context.utils.lodash.startCase('host utilities ready')}</p>
        <button onClick={() => count.value++}>计数 {count.value}</button>
      </main>
    )
  },
})
