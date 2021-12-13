// import { __DEV__ } from './env'
import {
  VNodeTypes,
  createVNode,
  toDisplayString,
  Directive,
  resolveDirective,
  withDirectives,
  vShow,
  vModelRadio,
  vModelCheckbox,
  vModelText,
  vModelSelect,
  vModelDynamic,
  isVNode
} from 'vue'
import { hasOwn, isFunction, isString, isArray, isSymbol, isObject } from '@vue/shared'

const vModelEleDirTypes = {
  select: vModelSelect,
  textarea: vModelText
}

const vModelDirTypes = {
  default: vModelText,
  radio: vModelRadio,
  checkbox: vModelCheckbox,
  dynamic: vModelDynamic
}

type PropHandler = (
  type: VNodeTypes,
  val: any,
  props: Record<string, any>,
  directives: Array<any[]>,
  config: Record<string, any>
) => any
interface ModelConfig<T = any> {
  get: () => T
  set: (val: T) => void
  modifiers?: string[]
  prop?: string
}
// todo refactor
const PROP_CASES: Record<string, PropHandler> = {
  children: (type: VNodeTypes, nodes: VNodeTypes | VNodeTypes[], props, directives, config) => {
    if (props.__processed__children) return
    props.__processed__children = true
    if (isString(type) || isSymbol(type)) {
      if (!isArray(nodes) && isVNode(nodes)) {
        nodes = [nodes]
      }
      props.children = nodes
    } else {
      // component
      if (isVNode(nodes) || isArray(nodes) || !isObject(nodes)) {
        // nodes
        props.children = {
          default: isFunction(nodes) ? nodes : () => nodes
        }
      } else {
        // is object slots
        props.children = nodes
      }
    }
  },
  // directives
  'v-html': (type: VNodeTypes, val, props) => {
    props.innerHTML = val
  },
  'v-text': (type: VNodeTypes, val, props) => {
    props.textContent = toDisplayString(val)
  },
  'v-show': (type: VNodeTypes, val, props, directives) => {
    directives.push([vShow, val])
  },
  'v-model': (type: VNodeTypes, val: ModelConfig, props, directives, config) => {
    const isPlainNode = isString(type) || isSymbol(type)
    const { get, set, modifiers = [], prop = 'modelValue' } = val

    props[prop] = get()

    const fixProp = prop === 'modelValue' ? 'model' : prop
    const fixModifiersKey = `${fixProp}Modifiers`
    if (modifiers.length) {
      props[fixModifiersKey] = modifiers.reduce((pre, modifier) => {
        pre[modifier] = true
        return pre
      }, {} as Record<string, boolean>)
    }
    // @ts-ignore
    props[`onUpdate:${prop}`] = ($event) => {
      set($event)
      return $event
    }
    // @ts-ignore
    const eleDir = vModelEleDirTypes[type]
    // @ts-ignore
    const typeDir = (isString(config.type) || !config.type) ? (vModelDirTypes[config.type] || vModelDirTypes.default) : vModelDirTypes.dynamic
    const directiveName = eleDir || typeDir
    directives.push([
      directiveName,
      props[prop],
      isPlainNode ? undefined : prop,
      props[fixModifiersKey]
    ])
    if (isPlainNode) {
      // delete props value
      delete props[prop]
      delete props[fixModifiersKey]
    } else {
      // component, do not need to add vModel dir
      directives.pop()
    }
  },
  'v-slots': (type: VNodeTypes, val, props, directives, config) => {
    PROP_CASES.children(type, config.children, props, directives, config)
    const children = props.children
    if (!children || !children.default) {
      // just normal nodes
      let defaultSlot = children
      if (children) {
        if (!isFunction(children)) {
          defaultSlot = () => children
        }
      }
      props.children = {}
      if (defaultSlot) {
        props.children.default = defaultSlot
      }
    }
    Object.assign(props.children, val)
  }
}

// todo
const reversedProps = {
  children: 1,
  __processed__children: 1
}

const xlinkRE = /^xlink([A-Z])/

export function jsx(
  type: VNodeTypes,
  config: Record<string, any> = {},
  maybeKey?: string,
  source?: object,
  self?: any
) {
  let propName: string
  const directives:Array<any[]> = []

  const props: Record<string, any> = {}

  for (propName in config) {
    if (hasOwn(config, propName)) {
      propName = propName as string
      const val = config[propName]
      if (hasOwn(PROP_CASES, propName)) {
        const propVal = PROP_CASES[propName](type, val, props, directives, config)
        if (propVal !== undefined) {
          props[propName] = propVal
        }
      } else {
        if (propName.match(xlinkRE)) {
          propName = propName.replace(xlinkRE, (_, firstCharacter) => `xlink:${firstCharacter.toLowerCase()}`)
        }
        props[propName] = val
      }
    }
  }

  const children = props.children

  Object.keys(reversedProps).forEach((k) => {
    delete props[k]
  })

  if (maybeKey !== undefined && !hasOwn(props, 'key')) {
    props.key = '' + maybeKey
  }
  const vnode = createVNode(type, props, children)
  if (directives.length) {
    // @ts-ignore
    return withDirectives(vnode, directives)
  }
  return vnode
}

export const jsxs = jsx
