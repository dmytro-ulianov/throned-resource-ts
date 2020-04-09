import {of, fromNullable, tryCatch} from '../src/constructors'
import {allResourcesTuple} from './shared'

it('creates resources using each constructor', () => {
  expect([...allResourcesTuple, of(42)]).toMatchInlineSnapshot(`
    Array [
      Object {
        "tag": "initial",
      },
      Object {
        "tag": "loading",
      },
      Object {
        "tag": "success",
        "value": Object {
          "title": "Peaky Blinders",
        },
      },
      Object {
        "error": [Error: boom],
        "tag": "failure",
      },
      Object {
        "tag": "success",
        "value": 42,
      },
    ]
  `)
})

it('creates resources using fromNullable', () => {
  expect([
    fromNullable({magicNumber: 42}),
    fromNullable(undefined),
    fromNullable(null),
  ]).toMatchInlineSnapshot(`
    Array [
      Object {
        "tag": "success",
        "value": Object {
          "magicNumber": 42,
        },
      },
      Object {
        "tag": "initial",
      },
      Object {
        "tag": "initial",
      },
    ]
  `)
})

it('creates resources using tryCatch', () => {
  expect([
    tryCatch(() => 42),
    tryCatch(() => {
      throw new Error('Boom')
    }),
  ]).toMatchInlineSnapshot(`
    Array [
      Object {
        "tag": "success",
        "value": 42,
      },
      Object {
        "error": [Error: Boom],
        "tag": "failure",
      },
    ]
  `)
})
