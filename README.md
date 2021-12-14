# vue-jsx-runtime [![npm](https://badgen.net/npm/v/vue-jsx-runtime)](https://www.npmjs.com/package/vue-jsx-runtime) [![build status](https://github.com/dolymood/vue-jsx-runtime/workflows/test/badge.svg)](https://github.com/dolymood/vue-jsx-runtime/actions/workflows/test.yml) [![coverage](https://badgen.net/codecov/c/github/dolymood/vue-jsx-runtime)](https://codecov.io/github/dolymood/vue-jsx-runtime)

Vue 3 jsx runtime support.

The background https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html . With new jsx runtime support, which means a JSX ast standard, every lib can have its own jsx syntax with small limits.

[Examples](https://github.com/dolymood/vue-jsx-runtime-examples) with TS:

- [vite](https://github.com/dolymood/vue-jsx-runtime-examples/tree/main/vite) with esbuild usage
- [vue-cli](https://github.com/dolymood/vue-jsx-runtime-examples/tree/main/vue-cli) with babel usage
- [swc](https://github.com/dolymood/vue-jsx-runtime-examples/tree/main/swc)

TODO:

- optimize, transformOn, isCustomElement ...
- dev validation
- more tests
- more features

## Installation

Install the plugin with:

```bash
pnpm add vue-jsx-runtime
# or
npm install vue-jsx-runtime
```

## Usage

### In Babel

```js
// babel plugin
plugins: [
  [
    // add @babel/plugin-transform-react-jsx
    '@babel/plugin-transform-react-jsx',
    {
      throwIfNamespace: false,
      runtime: 'automatic', 
      importSource: 'vue-jsx-runtime'
    }
  ],
],
```
### In TypeScript

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsxdev", /* 'react-jsx' or 'react-jsxdev'. You can also use 'preserve' to use babel or other tools to handle jsx*/
    "jsxImportSource": "vue-jsx-runtime"
  }
}
```

If you used with Babel, you need to set the config:

```json
{
  "compilerOptions": {
    "jsx": "preserve", /* 'react-jsx' or 'react-jsxdev'. You can also use 'preserve' to use babel or other tools to handle jsx*/
  }
}
```

### In Other Tools

If you use some tool which support jsx-runtime, like [swc](https://swc.rs/), you can use like this:

`.swcrc`:

```json
{
  "jsc": {
    "transform": {
      "react": {
        "runtime": "automatic",
        "importSource": "vue-jsx-runtime"
      }
    }
  }
}
```

More details, see https://swc.rs/docs/configuration/compilation#jsctransformreact

About [esbuild](https://github.com/evanw/esbuild/), see https://github.com/evanw/esbuild/issues/1172 and a hack way https://github.com/evanw/esbuild/issues/832 . https://github.com/evanw/esbuild/issues/334#issuecomment-711444731 .

## Syntax

### Content

Functional component:

```jsx
const App = () => <div>Vue 3.0</div>;
```

with render

```jsx
const App = {
  render() {
    return <div>Vue 3.0</div>;
  },
}
```

```jsx
import { withModifiers, defineComponent } from "vue";

const App = defineComponent({
  setup() {
    const count = ref(0);

    const inc = () => {
      count.value++;
    };

    return () => (
      <div onClick={withModifiers(inc, ["self"])}>{count.value}</div>
    );
  },
});
```

Fragment

```jsx
const App = () => (
  <>
    <span>I'm</span>
    <span>Fragment</span>
  </>
);
```

### Attributes / Props

```jsx
const App = () => <input type="email" />;
```

with a dynamic binding:

```jsx
const placeholderText = "email";
const App = () => <input type="email" placeholder={placeholderText} />;
```

### Directives

#### v-show

```jsx
const App = {
  data() {
    return { visible: true };
  },
  render() {
    return <input v-show={this.visible} />;
  },
};
```

#### v-model

A little different with `@vue/babel-plugin-jsx`.

Syntax:
```
v-model={[object, ["path/key"], argument, ["modifier"]]}
```

##### Recommend:

```jsx
const val = ref(1); // val.value will be 1
// jsx
<input v-model={val} /> // do not use v-model={val.value}
```

```jsx
<input v-model:argument={val} />
```

`v-model` will use `val["value"]` to getter or setter by default.

##### Other usage

```jsx
const val = ref(1);

<input v-model={[val, "value", ["modifier"]]} />
```

```jsx
<A v-model={[val, "value", "argument", ["modifier"]]} />
```

Will compile to:

```js
h(A, {
  argument: val["value"],
  argumentModifiers: {
    modifier: true,
  },
  "onUpdate:argument": ($event) => (val["value"] = $event),
});
```

#### custom directive

Recommended when using string arguments

```jsx
const App = {
  directives: { custom: customDirective },
  setup() {
    return () => <a v-custom:arg={val} />;
  },
};
```

```jsx
const App = {
  directives: { custom: customDirective },
  setup() {
    return () => <a v-custom={[val, ["value"], "arg", ["a", "b"]]} />;
  },
};
```

### Slot

> Note: In `jsx`, _`v-slot`_ should be replace with **`v-slots`**

#### Recommend

Use object slots:

```jsx
const A = (props, { slots }) => (
  <>
    <h1>{ slots.default ? slots.default() : 'foo' }</h1>
    <h2>{ slots.bar?.() }</h2>
  </>
);

const App = {
  setup() {
    return () => (
      <>
        <A>
          {{
            default: () => <div>A</div>,
            bar: () => <span>B</span>,
          }}
        </A>
        <B>{() => "foo"}</B>
      </>
    );
  },
};
```

#### Use v-slots

```jsx
const App = {
  setup() {
    const slots = {
      bar: () => <span>B</span>,
    };
    return () => (
      <A v-slots={slots}>
        <div>A</div>
      </A>
    );
  },
};
// or
const App = {
  setup() {
    const slots = {
      default: () => <div>A</div>,
      bar: () => <span>B</span>,
    };
    return () => <A v-slots={slots} />;
  },
};
```

## Different with [vue jsx-next](https://github.com/vuejs/jsx-next)

- `jsx-next` is a plugin for `Babel` only.
- `vue-jsx-runtime` can be used with `Babel`, `TypeScript`, `swc`, `esbuild` and more.

`vue-jsx-runtime` limits:

- can not merge ele/component props
- `v-model` syntax is little different with `jsx-next` - `v-model`
