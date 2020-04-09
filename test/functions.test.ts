import {initial, loading, success, failure} from '../src/constructors'
import {
  map,
  mapError,
  bimap,
  chain,
  tap,
  tapError,
  alt,
  getOrElse,
  fold,
  cata,
  ap,
  combine,
} from '../src/functions'
import {Resource} from '../src/types'

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
    // r.map(a -> a) is equal r
    const resources = getResources()

    expect(map(id)(resources.initial)).toEqual(resources.initial)
    expect(map(id)(resources.loading)).toEqual(resources.loading)
    expect(map(id)(resources.success)).toEqual(resources.success)
    expect(map(id)(resources.failure)).toEqual(resources.failure)
  })

  test('composition law', () => {
    // r.map(a -> f(g(a))) is equal r.map(g).map(f)
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
    // r.mapError(a -> a) is equal r
    const resources = getResources()

    expect(mapError(id)(resources.initial)).toEqual(resources.initial)
    expect(mapError(id)(resources.loading)).toEqual(resources.loading)
    expect(mapError(id)(resources.success)).toEqual(resources.success)
    expect(mapError(id)(resources.failure)).toEqual(resources.failure)
  })

  test('composition law', () => {
    // r.mapError(a -> f(g(a))) is equal r.mapError(g).mapError(f)
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
    // r.bimap(a -> a, e -> e) is equal r
    const resources = getResources()

    expect(bimap(id, id)(resources.initial)).toEqual(resources.initial)
    expect(bimap(id, id)(resources.loading)).toEqual(resources.loading)
    expect(bimap(id, id)(resources.success)).toEqual(resources.success)
    expect(bimap(id, id)(resources.failure)).toEqual(resources.failure)
  })

  test('composition law', () => {
    // r.bimap(a -> f(g(a)), e -> f(g(e))) is equal r.bimap(g, g).bimap(f, f)
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
    // r.chain(g).chain(f) is equal r.chain(a => g(a).chain(f))
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

describe('tap', () => {
  test('runs function only over success and returns always the same resource', () => {
    const value = 42
    const resources = getResources({value})

    const f = jest.fn((n: number) => ({order: 'Peaky Blinders', id: n}))

    expect(tap(f)(resources.initial)).toEqual(resources.initial)
    expect(tap(f)(resources.loading)).toEqual(resources.loading)
    expect(tap(f)(resources.success)).toEqual(resources.success)
    expect(tap(f)(resources.failure)).toEqual(resources.failure)

    expect(f).toBeCalledTimes(1)
    expect(f).toBeCalledWith(value)
  })
})

describe('tapError', () => {
  test('runs function only over failure and returns always the same resource', () => {
    const error = new Error('boom')
    const resources = getResources({error})

    const f = jest.fn((e: Error) => ({order: 'Peaky Blinders', error: e}))

    expect(tapError(f)(resources.initial)).toEqual(resources.initial)
    expect(tapError(f)(resources.loading)).toEqual(resources.loading)
    expect(tapError(f)(resources.success)).toEqual(resources.success)
    expect(tapError(f)(resources.failure)).toEqual(resources.failure)

    expect(f).toBeCalledTimes(1)
    expect(f).toBeCalledWith(error)
  })
})

describe('alt', () => {
  test('associativity law', () => {
    // r.alt(g).alt(f) is equal r.alt(a => g(a).alt(f))
    const resources = getResources()

    const f = () => success(100)
    const g = (): Resource<number> => loading

    expect(alt(f)(alt(g)(resources.initial))).toEqual(
      alt(() => alt(f)(g()))(resources.initial),
    )
    expect(alt(f)(alt(g)(resources.loading))).toEqual(
      alt(() => alt(f)(g()))(resources.loading),
    )
    expect(alt(f)(alt(g)(resources.failure))).toEqual(
      alt(() => alt(f)(g()))(resources.failure),
    )
    expect(alt(f)(alt(g)(resources.success))).toEqual(
      alt(() => alt(f)(g()))(resources.success),
    )
  })

  test('distributivity law', () => {
    const resources = getResources()

    const f = (n: number) => `number ${n}`
    const g = () => success(0)

    expect(map(f)(alt(g)(resources.initial))).toEqual(
      alt(() => map(f)(g()))(map(f)(resources.initial)),
    )
    expect(map(f)(alt(g)(resources.loading))).toEqual(
      alt(() => map(f)(g()))(map(f)(resources.loading)),
    )
    expect(map(f)(alt(g)(resources.success))).toEqual(
      alt(() => map(f)(g()))(map(f)(resources.success)),
    )
    expect(map(f)(alt(g)(resources.failure))).toEqual(
      alt(() => map(f)(g()))(map(f)(resources.failure)),
    )
  })

  test('uses function only when it is not success', () => {
    const resources = getResources()

    const altResource = success(100)
    const f = () => altResource

    expect(alt(f)(resources.initial)).toEqual(altResource)
    expect(alt(f)(resources.loading)).toEqual(altResource)
    expect(alt(f)(resources.success)).toEqual(resources.success)
    expect(alt(f)(resources.failure)).toEqual(altResource)
  })
})

describe('getOrElse', () => {
  test('uses function only when it is not success, returns value on success', () => {
    const value = 42
    const resources = getResources({value})

    const fallbackValue = 0
    const f = jest.fn(() => fallbackValue)

    expect(getOrElse(f)(resources.initial)).toEqual(fallbackValue)
    expect(getOrElse(f)(resources.loading)).toEqual(fallbackValue)
    expect(getOrElse(f)(resources.success)).toEqual(value)
    expect(getOrElse(f)(resources.failure)).toEqual(fallbackValue)

    expect(f).toBeCalledTimes(3)
  })
})

describe('fold', () => {
  test('runs proper function depending on current tag', () => {
    const value = 42
    const error = new Error('boom')
    const resources = getResources({value, error})

    const show = fold(
      () => 'initial',
      () => 'loading',
      (n: number) => `number ${n}`,
      (e: Error) => e.message,
    )

    expect(show(resources.initial)).toEqual('initial')
    expect(show(resources.loading)).toEqual('loading')
    expect(show(resources.success)).toEqual(`number ${value}`)
    expect(show(resources.failure)).toEqual(error.message)
  })
})

describe('cata', () => {
  test('runs proper function depending on current tag', () => {
    const value = 42
    const error = new Error('boom')
    const resources = getResources({value, error})

    const show = cata({
      initial: () => 'initial',
      loading: () => 'loading',
      success: (n: number) => `number ${n}`,
      failure: (e: Error) => e.message,
    })

    expect(show(resources.initial)).toEqual('initial')
    expect(show(resources.loading)).toEqual('loading')
    expect(show(resources.success)).toEqual(`number ${value}`)
    expect(show(resources.failure)).toEqual(error.message)
  })
})

describe('ap', () => {
  test('composition law', () => {
    // (ab -> bc -> a -> c).map(fac).ap(fbc).ap(fa) is equal fa.ap(fab).ap(fbc)
    const resources = getResources()

    type A = number
    type B = string
    type C = {message: string}

    const fab = success((n: A): B => `number ${n}`)
    const fbc = success((s: B): C => ({message: s.toUpperCase()}))
    const fac = (ab: (a: A) => B) => (bc: (b: B) => C) => (a: A) => bc(ab(a))

    expect(ap(resources.success)(ap(fbc)(map(fac)(fab)))).toEqual(
      ap(ap(resources.success)(fab))(fbc),
    )
  })

  test('properly uses ap depending on resource tags', () => {
    type R = Resource<number, Error>
    const value = 42
    const _ = getResources({value})
    const resources = {
      initial: <R>_.initial,
      loading: <R>_.loading,
      success: <R>_.success,
      failure: <R>_.failure,
    }

    type RF = Resource<(n: number) => string, Error>
    const f = (n: number) => `number ${n}`
    const rfs = {
      initial: <RF>initial,
      loading: <RF>loading,
      success: <RF>success(f),
      failure: <RF>failure(new Error('boom')),
    }

    expect(ap(resources.initial)(rfs.initial)).toEqual(resources.initial)
    expect(ap(resources.initial)(rfs.loading)).toEqual(resources.initial)
    expect(ap(resources.initial)(rfs.failure)).toEqual(resources.failure)
    expect(ap(resources.initial)(rfs.success)).toEqual(resources.initial)

    expect(ap(resources.loading)(rfs.initial)).toEqual(resources.initial)
    expect(ap(resources.loading)(rfs.loading)).toEqual(resources.loading)
    expect(ap(resources.loading)(rfs.failure)).toEqual(resources.failure)
    expect(ap(resources.loading)(rfs.success)).toEqual(resources.loading)

    expect(ap(resources.success)(rfs.initial)).toEqual(resources.initial)
    expect(ap(resources.success)(rfs.loading)).toEqual(resources.loading)
    expect(ap(resources.success)(rfs.failure)).toEqual(resources.failure)
    expect(ap(resources.success)(rfs.success)).toEqual(success(f(value)))

    expect(ap(resources.failure)(rfs.initial)).toEqual(resources.failure)
    expect(ap(resources.failure)(rfs.loading)).toEqual(resources.failure)
    expect(ap(resources.failure)(rfs.failure)).toEqual(resources.failure)
    expect(ap(resources.failure)(rfs.success)).toEqual(resources.failure)
  })
})

describe('combine', () => {
  test('properly uses combine depending on resource tags', () => {
    const value = 100
    const resources = getResources({value})

    expect(combine(resources.initial)).toEqual(resources.initial)
    expect(combine(resources.loading)).toEqual(resources.loading)
    expect(combine(resources.success)).toEqual(success([value]))
    expect(combine(resources.failure)).toEqual(resources.failure)

    type R = Resource<string, Error>
    const string = 'Peaky Blinders'
    const rs = {
      initial: <R>initial,
      loading: <R>loading,
      success: <R>success(string),
      failure: <R>failure(new Error('wow')),
    }

    expect(combine(resources.initial, rs.initial)).toEqual(resources.initial)
    expect(combine(resources.initial, rs.loading)).toEqual(resources.initial)
    expect(combine(resources.initial, rs.success)).toEqual(resources.initial)
    expect(combine(resources.initial, rs.failure)).toEqual(rs.failure)

    expect(combine(resources.loading, rs.initial)).toEqual(resources.initial)
    expect(combine(resources.loading, rs.loading)).toEqual(resources.loading)
    expect(combine(resources.loading, rs.success)).toEqual(resources.loading)
    expect(combine(resources.loading, rs.failure)).toEqual(rs.failure)

    expect(combine(resources.success, rs.initial)).toEqual(rs.initial)
    expect(combine(resources.success, rs.loading)).toEqual(rs.loading)
    expect(combine(resources.success, rs.success)).toEqual(
      success([value, string]),
    )
    expect(combine(resources.success, rs.failure)).toEqual(rs.failure)

    expect(combine(resources.failure, rs.initial)).toEqual(resources.failure)
    expect(combine(resources.failure, rs.loading)).toEqual(resources.failure)
    expect(combine(resources.failure, rs.success)).toEqual(resources.failure)
    expect(combine(resources.failure, rs.failure)).toEqual(resources.failure)
  })
})
