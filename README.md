# throned ▲ resource-ts

## Install

`npm install --save @throned/resource-ts`

`yarn add @throned/resource-ts`

Also it plays nicely with [fp-ts](https://github.com/gcanti/fp-ts) `pipe` function, so if you wish `yarn add fp-ts`.

## Intro

**Resource** is an [ADT (Algebraic Data Type)](https://wiki.haskell.org/Algebraic_data_type), that is heavily inspired by [**RemoteData**](https://github.com/krisajenkins/remotedata) from [Slaying a UI antipattern articles](https://medium.com/@gcanti/slaying-a-ui-antipattern-with-flow-5eed0cfb627b).

Simply put, **Resource** is representation of some asynchronous data in type-safe way that also allows you to drop `boolean` flags such as `isLoading`, `error` etc.

**`Resource<D, E>`** is a sum type of four possible states: `Initial`, `Loading`, `Success<`**`D`**`>` and `Failure<`**`E`**`>`, where **D** - is a type of data and **E** - is a type of possible error.

When your resource is in `Initial` or `Loading` state it holds no data, so just use `initial` and `loading` constants.
But `Success` holds some data and `Failure` holds the error, so for them you need to use `success` or `failure` function depending on result.

```ts
import {initial, loading, success, failure} from '@throned/resource-ts'

initial // {tag: 'initial'}
loading // {tag: 'loading'}
success({result: 'Blade Runner'}) // {tag: 'success', value: 'Blade Runner' }
failure(new Error('noop')) // {tag: 'failure', error: Error('nope')}
```

The proccess of wrapping your data into **Resource** called lifting. So when you do `const resource = success(await res.json())` - you lift your response in **Resource**.

So now, when your data is lifted, we can do different type-safe manipulations with it using functions from `@throned/resource-ts`. But first, let's see how to unwrap your data from **Resource**, or, using FP terms, fold it.

Let's use [React](https://reactjs.org/) for next example of folding your data into `JSX`. To do that we will use `fold` functions, it provides a type-safe way to extract value/error from your resource and enforces you to handle all possible states.

```tsx
import React from 'react'
import {fold} from '@throned/resource-ts'

type Movie = {id: string; title: string}

const renderMovies = fold(
  () => 'Nothing here',
  () => 'Loading movies...',
  (movies: Movie[]) => (
    <ul>
      {movies.map((movie) => (
        <li key={movie.id}>{movie.title}</li>
      ))}
    </ul>
  ),
  (error: Error) => `Oops! ${error.message}`,
)

const Movies = () => {
  const movies: Resource<Movie[], Error> = useMovies()

  return <div>{renderMovies(movies)}</div>
}
```

## API

Nothing there yet

## Guides

### Usage with fp-ts

While you can use bare `@throned/resource-ts`, it is recommended to use it with [fp-ts](https://github.com/gcanti/fp-ts) library, and especially with `pipe` function.
Almost all function in `@throned/resource-ts` are curried and data usually comes last and that where `pipe` shines. It can infer type from previously provided value.

```ts
import {of, map, tap} from '@throned/resource-ts'
import {pipe} from 'fp-ts/lib/pipeable'

type TVSeries = {title: string, network: string}
const tvSeries = of({title: 'Peaky Blinders', network: 'BBC'})

// To use map without pipe and keep types you have to provide it explicitly
const showSeries = (series: TVSeries) => console.log({series})
const getNetwork = (series: TVSeries) => series.network
const network = map(getNetwork)(tap(showSeries)(tvSeries))

// Alternatively you can use it with pipe and types will be inferred for you
const network = pipe(
  tvSeries,
  tap(series => console.log({series}))
  map(series => series.network),
)
```

### Working with multiple resources

Let's imagine next situation

```ts
import {of} from '@throned/resource-ts'

// You have to resources
const number = of(42)
const mulOptions = of({times: 10})

// And you have multiply function
const multiply = (x: number, {times}: {times: number}) => {
  return x * times
}
```

There are few ways of how you can call `multiply` function with values of these resources

**`chain`**

```ts
import {of, chain, map, tap} from '@throned/resource-fp'
import {pipe} from 'fp-ts/lib/pipeable'

const number = of(42)
const mulOptions = of({times: 10})

const multiply = (x: number, {times}: {times: number}) => {
  return x * times
}

pipe(
  number,
  chain((x) =>
    map((options: {times: number}) => multiply(x, options))(mulOptions),
  ),
  tap(console.log), // 420
)
```

**`ap`**

```ts
import {of, chain, map, tap} from '@throned/resource-fp'
import {pipe} from 'fp-ts/lib/pipeable'

const number = of(42)
const mulOptions = of({times: 10})

const multiply = (x: number) => ({times}: {times: number}) => {
  return x * times
}

/**
 * You can define useful function that uses ap and map
 * To apply a function to resources
 *
 * To see why this functions is not included in the lib check the next example
 */
const lift2 = <A, B, C, E>(
  a: Resource<A, E>,
  b: Resource<B, E>,
  f: (a: A) => (b: B) => C,
): Resource<C, E> => {
  return pipe(a, map(f), ap(b))
}

tap(console.log)(lift2(number, mulOptions, multiply)) // 420
```

**`combine`**

```ts
import {of, combine, map, tap} from '@throned/resource-fp'
import {pipe} from 'fp-ts/lib/pipeable'

const number = of(42)
const mulOptions = of({times: 10})

const multiply = (x: number, {times}: {times: number}) => {
  return x * times
}

pipe(
  /**
   * combine is the most convenient way to work with multiple resources
   * it merges all resources into one tuple that can be used later one
   */
  combine(number, mulOptions),
  map((number, options) => multiply(number, options))
  tap(console.log) // 420
)

// Also you can pass more than 2 resources into combine
combine(number, mulOptions) // Resource<[number, {times: number}], unknown>
combine(number, mulOptions, of('check me')) // Resource<[number, {times: number}, string], unknown>
```
