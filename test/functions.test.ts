import {initial, loading, success, failure} from '../src/constructors'
import {map, mapError} from '../src/functions'

const id = <A>(a: A) => a

const getResources = (params: {value?: number; error?: Error} = {}) => {
  const {value = 42, error = new Error('boom')} = params
  return {
    initial: initial,
    loading: loading,
    success: success(value),
    failure: failure(error),
  }
}

describe('map', () => {
  test('identity law', () => {
    const resources = getResources()

    expect(map(id)(resources.initial)).toEqual(resources.initial)
    expect(map(id)(resources.loading)).toEqual(resources.loading)
    expect(map(id)(resources.success)).toEqual(resources.success)
    expect(map(id)(resources.failure)).toEqual(resources.failure)
  })

  test('composition law', () => {
    const {initial, loading, success, failure} = getResources()

    const f = (a: number) => a * 2
    const g = (a: number) => a + 8

    expect(map(f)(map(g)(initial))).toEqual(
      map((a: number) => f(g(a)))(initial),
    )
    expect(map(f)(map(g)(loading))).toEqual(
      map((a: number) => f(g(a)))(loading),
    )
    expect(map(f)(map(g)(success))).toEqual(
      map((a: number) => f(g(a)))(success),
    )
    expect(map(f)(map(g)(failure))).toEqual(
      map((a: number) => f(g(a)))(failure),
    )
  })

  test('runs function only over success', () => {
    const value = 50
    const resources = getResources({value})

    const double = (a: number) => a * 2

    expect(map(double)(resources.initial)).toEqual(resources.initial)
    expect(map(double)(resources.loading)).toEqual(resources.loading)
    expect(map(double)(resources.success)).toEqual(success(double(value)))
    expect(map(double)(resources.failure)).toEqual(resources.failure)
  })
})

describe('mapError', () => {
  test('identity law', () => {
    const resources = getResources()

    expect(mapError(id)(resources.initial)).toEqual(resources.initial)
    expect(mapError(id)(resources.loading)).toEqual(resources.loading)
    expect(mapError(id)(resources.success)).toEqual(resources.success)
    expect(mapError(id)(resources.failure)).toEqual(resources.failure)
  })

  test('composition law', () => {
    const {initial, loading, success, failure} = getResources()

    const f = (s: string) => s.toUpperCase()
    const g = (e: Error) => e.message

    expect(mapError(f)(mapError(g)(initial))).toEqual(
      mapError((e: Error) => f(g(e)))(initial),
    )
    expect(mapError(f)(mapError(g)(loading))).toEqual(
      mapError((e: Error) => f(g(e)))(loading),
    )
    expect(mapError(f)(mapError(g)(success))).toEqual(
      mapError((e: Error) => f(g(e)))(success),
    )
    expect(mapError(f)(mapError(g)(failure))).toEqual(
      mapError((e: Error) => f(g(e)))(failure),
    )
  })

  test('runs function only over failure', () => {
    const error = new Error('panic')
    const resources = getResources({error})

    const getMessage = (e: Error) => e.message

    expect(mapError(getMessage)(resources.initial)).toEqual(resources.initial)
    expect(mapError(getMessage)(resources.loading)).toEqual(resources.loading)
    expect(mapError(getMessage)(resources.success)).toEqual(resources.success)
    expect(mapError(getMessage)(resources.failure)).toEqual(
      failure(getMessage(error)),
    )
  })
})
