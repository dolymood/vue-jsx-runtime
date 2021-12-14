import { Fragment } from 'vue'
import { jsx as prodJsx, jsxs as prodJsxs } from './jsx'
import {
  jsxWithValidationStatic,
  jsxWithValidationDynamic,
  jsxWithValidation
} from './dev'

// istanbul ignore next
const jsx = __DEV__ ? jsxWithValidationDynamic : prodJsx
// istanbul ignore next
const jsxs = __DEV__ ? jsxWithValidationStatic : prodJsxs
// istanbul ignore next
const jsxDEV = __DEV__ ? jsxWithValidation : undefined

export { Fragment, jsx, jsxs, jsxDEV }
