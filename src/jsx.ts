// import { __DEV__ } from './env'
import {
  VNodeTypes,
  createVNode,
  toDisplayString,
  resolveDirective,
  withDirectives,
  vShow,
  vModelRadio,
  vModelCheckbox,
  vModelText,
  vModelSelect,
  vModelDynamic,
  isVNode,
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
  config: Record<string, any>,
  arg?: string,
  // modifiers?: string | string[],
  name?: string
) => any
type DirValue = [object, string | any[], string | string[], string[]] | any

const DIR_CASES: Record<string, PropHandler> = {
  // directives
  html: (type: VNodeTypes, val, props) => {
    props.innerHTML = val
  },
  text: (type: VNodeTypes, val, props) => {
    props.textContent = toDisplayString(val)
  },
  show: (type: VNodeTypes, val, props, directives) => {
    directives.push([vShow, val])
  },
  model: (type: VNodeTypes, val: DirValue, props, directives, config, arg) => {
    const isPlainNode = isString(type) || isSymbol(type)

    const [{ get, set }, args, modifiers] = processDirVal(val, arg)

    const prop = args || 'modelValue'

    props[prop] = get()

    const fixProp = prop === 'modelValue' ? 'model' : prop
    const fixModifiersKey = `${fixProp}Modifiers`
    props[fixModifiersKey] = modifiers

    // @ts-ignore
    props[`onUpdate:${prop}`] = set
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
  slots: (type: VNodeTypes, val, props, directives, config) => {
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
  },
  __custom__: (type: VNodeTypes, val: DirValue, props, directives, config, arg, name) => {
    const [{ get, set }, args, modifiers] = processDirVal(val, arg)

    props[`onUpdate:${name}`] = set

    directives.push([
      resolveDirective(name!),
      get(),
      args,
      modifiers
    ])
  }
}

const PROP_CASES: Record<string, PropHandler> = {
  children: (type: VNodeTypes, nodes: VNodeTypes | VNodeTypes[], props) => {
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
      // /^(v-[A-Za-z0-9-]|:|\.|@|#)/
      if (/^(v-[A-Za-z0-9-])/.test(propName)) {
        // directive
        // /(?:^v-([a-z0-9-]+))?(?:(?::|^\.|^@|^#)(\[[^\]]+\]|[^\.]+))?(.+)?$/i
        const match = /(?:^v-([a-z0-9-]+))?(?:(?::)([^\.]+))?(.+)?$/i.exec(propName)
        const dirName = match![1]
        const arg = match![2]

        // let modifiers = match![3] && match![3].slice(1).split('.') as string[]
        const dirFn = DIR_CASES[dirName] || DIR_CASES.__custom__
        dirFn(type, val, props, directives, config, arg, dirName)
      } else {
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

function processDirVal (val: DirValue, arg?: string) {
  if (!isArray(val)) {
    val = [val, 'value']
  }

  let [value, path, args, modifiers] = val

  if (isArray(args)) {
    // args is modifiers
    modifiers = args
    args = undefined
  }

  if (!arg) {
    arg = args
  }

  const _modifiers = modifiers ? processModifiers(modifiers) : undefined

  const paths = isArray(path) ? path : [path]

  const get = () => {
    return baseGetSet(value, paths)
  }
  const set = (v: any) => {
    return baseGetSet(value, paths, v)
  }

  return [{ get, set }, arg, _modifiers] as const
}

function processModifiers (modifiers: string | string[]) {
  modifiers = Array.isArray(modifiers) ? modifiers : modifiers ? [modifiers] : []
  const realModifiers: Record<string, boolean> = {}
  modifiers.forEach((modifier) => {
    realModifiers[modifier] = true
  })
  return realModifiers
}

function baseGetSet(object: object, paths: string[], set?: any) {
  let val: any = object

  let index = 0
  const length = paths.length
  const max = length - 1

  while (val != null && index <= max) {
    if (set && index === max) {
      val[paths[index]] = set
      return set
    }
    val = val[paths[index++]]
  }

  return (index && index == length) ? val : undefined
}
