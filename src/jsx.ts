// import { __DEV__ } from './env'
import { VNodeTypes, createVNode } from 'vue'
import { hasOwn } from '@vue/shared'

type Handler = (
  val: any,
  config: Record<string, any>,
  props: Record<string, any>
) => any
// todo cases
const PROP_CASES: Record<string, Handler> = {
  children: (nodes: VNodeTypes | VNodeTypes[]) => {
    // process children
    return nodes
  },
  // directives
  'v-model': (modelValue, config, props) => {
    debugger
    props.modelValue = modelValue
    // @ts-ignore
    props["onUpdate:modelValue"] = ($event) => {
      modelValue = $event
      return $event
    }
  }
}

export function jsx(
  type: VNodeTypes,
  config: Record<string, any> = {},
  maybeKey?: string,
  source?: object,
  self?: any
) {
  let propName

  const props: Record<string, any> = {}

  for (propName in config) {
    if (hasOwn(config, propName)) {
      const val = config[propName]
      if (hasOwn(PROP_CASES, propName)) {
        props[propName] = PROP_CASES[propName](val, config, props)
      } else {
        props[propName] = val
      }
    }
  }

  const children = props.children
  delete props.children

  if (maybeKey !== undefined && !hasOwn(props, 'key')) {
    props.key = '' + maybeKey
  }
  debugger
  return createVNode(type, props, children)
}

export const jsxs = jsx
