// use https://github.com/vuejs/jsx-next/tree/dev/packages/babel-plugin-jsx test cases
import { shallowMount, mount } from '@vue/test-utils'
import { defineComponent, VNode } from 'vue'

test('input[type="checkbox"] should work', async () => {
  const wrapper = shallowMount({
    data() {
      return {
        test: true,
      }
    },
    render() {
      const model = {
        get: () => {
          return this.test
        },
        set: (val: boolean) => {
          this.test = val
        }
      }
      return <input type="checkbox" v-model={model}/>
    },
  }, {
    // fix jsdom https://github.com/jsdom/jsdom/commit/1da0a4c1f4a0e9f8fa5576a9c5e2897b8307f7ab
    attachTo: document.body
  })

  expect(wrapper.vm.$el.checked).toBe(true)
  wrapper.vm.test = false
  await wrapper.vm.$nextTick()
  expect(wrapper.vm.$el.checked).toBe(false)
  expect(wrapper.vm.test).toBe(false)
  await wrapper.trigger('click')
  expect(wrapper.vm.$el.checked).toBe(true)
  expect(wrapper.vm.test).toBe(true)
})

test('input[type="radio"] should work', async () => {
  const wrapper = mount({
    data: () => ({
      test: '1',
    }),
    render() {
      const model = {
        get: () => {
          return this.test
        },
        set: (val: string) => {
          this.test = val
        }
      }
      return (
        <>
          <input type="radio" value="1" v-model={model} name="test" />
          <input type="radio" value="2" v-model={model} name="test" />
        </>
      )
    },
  }, {
    // fix jsdom https://github.com/jsdom/jsdom/commit/1da0a4c1f4a0e9f8fa5576a9c5e2897b8307f7ab
    attachTo: document.body
  })

  const [a, b] = wrapper.vm.$.subTree.children as VNode[]

  expect(a.el!.checked).toBe(true)
  wrapper.vm.test = '2'
  await wrapper.vm.$nextTick()
  expect(a.el!.checked).toBe(false)
  expect(b.el!.checked).toBe(true)
  await a.el!.click()
  expect(a.el!.checked).toBe(true)
  expect(b.el!.checked).toBe(false)
  expect(wrapper.vm.test).toBe('1')
})

test('select should work with value bindings', async () => {
  const wrapper = shallowMount({
    data: () => ({
      test: 2,
    }),
    render() {
      const model = {
        get: () => this.test,
        set: (val: number) => this.test = val
      }
      return (
        <select v-model={model}>
          <option value="1">a</option>
          <option value={2}>b</option>
          <option value={3}>c</option>
        </select>
      )
    },
  })

  const el = wrapper.vm.$el

  expect(el.value).toBe('2')
  expect(el.children[1].selected).toBe(true)
  wrapper.vm.test = 3
  await wrapper.vm.$nextTick()
  expect(el.value).toBe('3')
  expect(el.children[2].selected).toBe(true)

  el.value = '1'
  await wrapper.trigger('change')
  expect(wrapper.vm.test).toBe('1')

  el.value = '2'
  await wrapper.trigger('change')
  expect(wrapper.vm.test).toBe(2)
})

test('textarea should update value both ways', async () => {
  const wrapper = shallowMount({
    data: () => ({
      test: 'b',
    }),
    render() {
      const model = {
        get: () => this.test,
        set: (val: string) => this.test = val
      }
      return <textarea v-model={model} />
    },
  })
  const el = wrapper.vm.$el

  expect(el.value).toBe('b')
  wrapper.vm.test = 'a'
  await wrapper.vm.$nextTick()
  expect(el.value).toBe('a')
  el.value = 'c'
  await wrapper.trigger('input')
  expect(wrapper.vm.test).toBe('c')
})

test('input[type="text"] should update value both ways', async () => {
  const wrapper = shallowMount({
    data: () => ({
      test: 'b',
    }),
    render() {
      const model = {
        get: () => this.test,
        set: (val: string) => this.test = val
      }
      return <input v-model={model} />
    },
  })
  const el = wrapper.vm.$el

  expect(el.value).toBe('b')
  wrapper.vm.test = 'a'
  await wrapper.vm.$nextTick()
  expect(el.value).toBe('a')
  el.value = 'c'
  await wrapper.trigger('input')
  expect(wrapper.vm.test).toBe('c')
})

test('input[type="text"] .lazy modifier', async () => {
  const wrapper = shallowMount({
    data: () => ({
      test: 'b',
    }),
    render() {
      const model = {
        get: () => this.test,
        set: (val: string) => this.test = val,
        modifiers: ['lazy']
      }
      return <input v-model={model} />
    },
  })
  const el = wrapper.vm.$el

  expect(el.value).toBe('b')
  expect(wrapper.vm.test).toBe('b')
  el.value = 'c'
  await wrapper.trigger('input')
  expect(wrapper.vm.test).toBe('b')
  el.value = 'c'
  await wrapper.trigger('change')
  expect(wrapper.vm.test).toBe('c')
})

test('dynamic type should work', async () => {
  const wrapper = shallowMount({
    data() {
      return {
        test: true,
        type: 'checkbox',
      }
    },
    render() {
      const model = {
        get: () => this.test,
        set: (val: boolean) => this.test = val
      }
      return <input type={this.type} v-model={model} />
    },
  })

  expect(wrapper.vm.$el.checked).toBe(true)
  wrapper.vm.test = false
  await wrapper.vm.$nextTick()
  expect(wrapper.vm.$el.checked).toBe(false)
})

test('underscore modifier should work', async () => {
  const wrapper = shallowMount({
    data: () => ({
      test: 'b',
    }),
    render() {
      const model = {
        get: () => this.test,
        set: (val: string) => this.test = val,
        modifiers: ['lazy']
      }
      return <input v-model={model} />
    },
  })
  const el = wrapper.vm.$el

  expect(el.value).toBe('b')
  expect(wrapper.vm.test).toBe('b')
  el.value = 'c'
  await wrapper.trigger('input')
  expect(wrapper.vm.test).toBe('b')
  el.value = 'c'
  await wrapper.trigger('change')
  expect(wrapper.vm.test).toBe('c')
})

test('underscore modifier should work in custom component', async () => {
  const Child = defineComponent({
    emits: ['update:modelValue'],
    props: {
      modelValue: {
        type: Number,
        default: 0,
      },
      modelModifiers: {
        default: () => ({ double: false }),
      },
    },
    setup(props, { emit }) {
      const handleClick = () => {
        emit('update:modelValue', 3)
      }
      return () => (
        <div onClick={handleClick}>
          {props.modelModifiers.double
            ? props.modelValue * 2
            : props.modelValue}
        </div>
      )
    },
  })

  const wrapper = mount({
    data() {
      return {
        foo: 1,
      }
    },
    render() {
      const model = {
        get: () => this.foo,
        set: (val: number) => this.foo = val,
        modifiers: ['double']
      }
      return <Child v-model={model} />
    },
  })

  expect(wrapper.html()).toBe('<div>2</div>')
  wrapper.vm.$data.foo += 1
  await wrapper.vm.$nextTick()
  expect(wrapper.html()).toBe('<div>4</div>')
  await wrapper.trigger('click')
  expect(wrapper.html()).toBe('<div>6</div>')
})

test('Named model', async () => {
  const Child = defineComponent({
    emits: ['update:value'],
    props: {
      value: {
        type: Number,
        default: 0,
      },
    },
    setup(props, { emit }) {
      const handleClick = () => {
        emit('update:value', 2)
      }
      return () => (
        <div onClick={ handleClick }>{ props.value }</div>
      )
    },
  })

  const wrapper = mount({
    data: () => ({
      foo: 0,
    }),
    render() {
      const model = {
        get: () => this.foo,
        set: (val: number) => this.foo = val,
        prop: 'value'
      }
      return <Child v-model={ model } />
    },
  })

  expect(wrapper.html()).toBe('<div>0</div>')
  wrapper.vm.$data.foo += 1
  await wrapper.vm.$nextTick()
  expect(wrapper.html()).toBe('<div>1</div>')
  await wrapper.trigger('click')
  expect(wrapper.html()).toBe('<div>2</div>')
})
