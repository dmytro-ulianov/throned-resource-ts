import {initial, loading, success, failure} from '../src/constructors'
import {map, mapError, bimap, chain} from '../src/functions'

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
    const resources = getResources()

    const f = (n: number) => n * 2
    const g = (n: number) => n + 8

    expect(map(f)(map(g)(resources.initial))).toEqual(
      map((n: number) => f(g(n)))(resources.initial),
    )
    expect(map(f)(map(g)(resources.loading))).toEqual(
      map((n: number) => f(g(n)))(resources.loading),
    )
    expect(map(f)(map(g)(resources.success))).toEqual(
      map((n: number) => f(g(n)))(resources.success),
    )
    expect(map(f)(map(g)(resources.failure))).toEqual(
      map((n: number) => f(g(n)))(resources.failure),
    )
  })

  test('runs function only over success', () => {
    const value = 50
    const resources = getResources({value})

    const double = (n: number) => n * 2

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

describe('bimap', () => {
  test('identity law', () => {
    const resources = getResources()

    expect(bimap(id, id)(resources.initial)).toEqual(resources.initial)
    expect(bimap(id, id)(resources.loading)).toEqual(resources.loading)
    expect(bimap(id, id)(resources.success)).toEqual(resources.success)
    expect(bimap(id, id)(resources.failure)).toEqual(resources.failure)
  })

  test('composition law', () => {
    const resources = getResources()

    const fd = (n: number) => `number ${n}`
    const gd = (n: number) => n + 8

    const fe = (s: string) => s.split('')
    const ge = (e: Error) => e.message

    expect(bimap(fd, fe)(bimap(gd, ge)(resources.initial))).toEqual(
      bimap(
        (n: number) => fd(gd(n)),
        (e: Error) => fe(ge(e)),
      )(resources.initial),
    )
    expect(bimap(fd, fe)(bimap(gd, ge)(resources.loading))).toEqual(
      bimap(
        (n: number) => fd(gd(n)),
        (e: Error) => fe(ge(e)),
      )(resources.loading),
    )
    expect(bimap(fd, fe)(bimap(gd, ge)(resources.success))).toEqual(
      bimap(
        (n: number) => fd(gd(n)),
        (e: Error) => fe(ge(e)),
      )(resources.success),
    )
    expect(bimap(fd, fe)(bimap(gd, ge)(resources.failure))).toEqual(
      bimap(
        (n: number) => fd(gd(n)),
        (e: Error) => fe(ge(e)),
      )(resources.failure),
    )
  })

  test('runs function over success & failure', () => {
    const value = 50
    const error = new Error('panic')
    const resources = getResources({value, error})

    const double = (n: number) => n * 2
    const getMessage = (e: Error) => e.message

    expect(bimap(double, getMessage)(resources.initial)).toEqual(
      resources.initial,
    )
    expect(bimap(double, getMessage)(resources.loading)).toEqual(
      resources.loading,
    )
    expect(bimap(double, getMessage)(resources.success)).toEqual(
      success(double(value)),
    )
    expect(bimap(double, getMessage)(resources.failure)).toEqual(
      failure(getMessage(error)),
    )
  })
})

describe('chain', () => {
  test('associativity law', () => {
    const resources = getResources()

    const f = (n: number) => success(`number ${n}`)
    const g = (n: number) => success(n + 8)

    expect(chain(f)(chain(g)(resources.initial))).toEqual(
      chain((n: number) => chain(f)(g(n)))(resources.initial),
    )
    expect(chain(f)(chain(g)(resources.loading))).toEqual(
      chain((n: number) => chain(f)(g(n)))(resources.loading),
    )
    expect(chain(f)(chain(g)(resources.success))).toEqual(
      chain((n: number) => chain(f)(g(n)))(resources.success),
    )
    expect(chain(f)(chain(g)(resources.failure))).toEqual(
      chain((n: number) => chain(f)(g(n)))(resources.failure),
    )
  })

  test('runs function only over success', () => {
    const value = 100
    const resources = getResources({value})

    const showNumber = (n: number) => success(`number ${n}`)

    expect(chain(showNumber)(resources.initial)).toEqual(resources.initial)
    expect(chain(showNumber)(resources.loading)).toEqual(resources.loading)
    expect(chain(showNumber)(resources.success)).toEqual(showNumber(value))
    expect(chain(showNumber)(resources.failure)).toEqual(resources.failure)
  })
})
