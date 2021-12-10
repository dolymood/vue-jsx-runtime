import { __DEV__ } from './env'
import { Fragment } from 'vue'
import { jsx as prodJsx, jsxs as prodJsxs } from './jsx'
import {
  jsxWithValidationStatic,
  jsxWithValidationDynamic,
  jsxWithValidation
} from './dev'

const jsx = __DEV__ ? jsxWithValidationDynamic : prodJsx
const jsxs = __DEV__ ? jsxWithValidationStatic : prodJsxs
const jsxDEV = __DEV__ ? jsxWithValidation : undefined

export { Fragment, jsx, jsxs, jsxDEV }
