# Lisp JS

This is a functional programming language that is inspired by Clojure(or ClojureScript), but with a different perspective.

## Examples of Code

Working Examples are in the [examples](https://github.com/whiteand/lisp-js/tree/main/examples) folder

## Lisp JS Roadmap

|                    Goal                    |       Status        |
| :----------------------------------------: | :-----------------: |
|               String Literal               |      **Done**       |
|               Number Literal               |      **Done**       |
|              Boolean Literal               |      **Done**       |
|               Vector Literal               |      **Done**       |
|                List Literal                |      **Done**       |
|                If statement                |      **Done**       |
|               If expression                |      **Done**       |
|           constants declaration            |      **Done**       |
|            function declaration            |      **Done**       |
|             chain comparisons              |      **Done**       |
|              panic expression              |      **Done**       |
|                    iife                    |      **Done**       |
|             equality operator              |      **Done**       |
|              for-of statement              |      **Done**       |
|           immutable collections            | Not implemented yet |
|     utility functions for collections      | Not implemented yet |
|             for-of expression              | Not implemented yet |
|          module system as in Deno          | Not implemented yet |
|     observables as first class object      | Not implemented yet |
|      tail call recursion optimization      | Not implemented yet |
|            macros as in Clojure            | Not implemented yet |
|             VS Code extension              | Not implemented yet |
| Vite plugin for importing .ljs as a module | Not implemented yet |

## Lisp JS Goals

- Functional Language with Immutable Data structures by default
- Controlled access to the platform feature per module
  - As in lavamoat

## What is the result of compilation

The result of compilation will be the ecma script module that has such shape:

```javascript
// Pure functions from std lib

export default function MAIN(dependencies) {
    // module code
    return {
        // Exported functions
    }
}
```

Example:

```javascript
export default function MAIN({ random }) {
    const randomInt = (max) => Math.floor(random() * max)
    return {
        randomInt,
    }
}
```

Example of usage:

```javascript
import createRandom from './random.ljs'

const random = createRandom({ random: Math.random })

console.log(random.randomInt(100))
```