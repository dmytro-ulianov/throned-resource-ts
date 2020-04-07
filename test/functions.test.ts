import {initial, loading, success, failure} from '../src/constructors'
import {map} from '../src/functions'

const id = <A>(a: A) => a

const getResources = (value: number = 42) => {
  return {
    initial: initial,
    loading: loading,
    success: success(value),
    failure: failure(new Error('boom')),
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

    const f = (a: number) => a + 8
    const g = (a: number) => a * 2

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
    const resources = getResources(value)

    const double = (a: number) => a * 2

    expect(map(double)(resources.initial)).toEqual(resources.initial)
    expect(map(double)(resources.loading)).toEqual(resources.loading)
    expect(map(double)(resources.success)).toEqual(success(double(value)))
    expect(map(double)(resources.failure)).toEqual(resources.failure)
  })
})