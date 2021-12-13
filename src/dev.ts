import { VNodeTypes } from 'vue'
import { jsx } from './jsx'

export function jsxDEV(
  type: VNodeTypes,
  config: Record<string, any> = {},
  maybeKey?: string,
  source?: object,
  self?: any
) {
  if (__DEV__) {
    return jsx(type, config, maybeKey, source, self)
  }
}

export function jsxWithValidation(
  type: VNodeTypes,
  props: Record<string, any> = {},
  key?: string,
  isStaticChildren?: boolean,
  source?: object,
  self?: any
) {
  // todo
  return jsxDEV(type, props, key, source, self)
}

export function jsxWithValidationStatic(
  type: VNodeTypes,
  props: Record<string, any> = {},
  key?: string
) {
  if (__DEV__) {
    return jsxWithValidation(type, props, key, true)
  }
}

export function jsxWithValidationDynamic(
  type: VNodeTypes,
  props: Record<string, any> = {},
  key?: string
) {
  if (__DEV__) {
    return jsxWithValidation(type, props, key, false)
  }
}
