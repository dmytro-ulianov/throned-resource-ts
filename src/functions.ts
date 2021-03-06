import {Resource, AnyResource} from './types'
import {success, failure} from './constructors'
import {isSuccess, isFailure, isLoading} from './type-guards'

export const map = <D, T>(f: (d: D) => T) => <E>(
  r: Resource<D, E>,
): Resource<T, E> => {
  return isSuccess(r) ? success(f(r.value)) : r
}

export const mapError = <E, EE>(f: (e: E) => EE) => <D>(
  r: Resource<D, E>,
): Resource<D, EE> => {
  return isFailure(r) ? failure(f(r.error)) : r
}

export const bimap = <D, E, T, EE>(
  map: (d: D) => T,
  mapError: (e: E) => EE,
) => (r: Resource<D, E>): Resource<T, EE> => {
  if (isSuccess(r)) return success(map(r.value))
  if (isFailure(r)) return failure(mapError(r.error))
  return r
}

export const chain = <D, T>(f: (d: D) => Resource<T, any>) => <E>(
  r: Resource<D, E>,
): Resource<T, E> => {
  return isSuccess(r) ? f(r.value) : r
}

export const tap = <D>(f: (d: D) => void) => <E>(
  r: Resource<D, E>,
): Resource<D, E> => {
  if (isSuccess(r)) {
    f(r.value)
  }
  return r
}

export const tapError = <E>(f: (e: E) => void) => <D>(
  r: Resource<D, E>,
): Resource<D, E> => {
  if (isFailure(r)) {
    f(r.error)
  }
  return r
}

export const alt = <D, E>(fr: () => Resource<D, E>) => (
  r: Resource<D, E>,
): Resource<D, E> => {
  return isSuccess(r) ? r : fr()
}

export const getOrElse = <D>(f: () => D) => <E>(r: Resource<D, E>): D => {
  return isSuccess(r) ? r.value : f()
}

export const fold = <D, E, R>(
  onInitial: () => R,
  onLoading: () => R,
  onSuccess: (value: D) => R,
  onFailure: (error: E) => R,
) => (r: Resource<D, E>): R => {
  switch (r.tag) {
    case 'initial':
      return onInitial()
    case 'loading':
      return onLoading()
    case 'success':
      return onSuccess(r.value)
    case 'failure':
      return onFailure(r.error)
  }
}

const void0 = <T>() => (void 0 as unknown) as T

export const cata = <
  D,
  E,
  RI = undefined,
  RL = undefined,
  RS = undefined,
  RF = undefined
>(fs: {
  initial?: () => RI
  loading?: () => RL
  success?: (value: D) => RS
  failure?: (error: E) => RF
}) => (r: Resource<D, E>): RI | RL | RS | RF => {
  return fold<D, E, RI | RL | RS | RF>(
    fs.initial ?? void0,
    fs.loading ?? void0,
    fs.success ?? void0,
    fs.failure ?? void0,
  )(r)
}

// todo: list priorities somewhere
export const ap = <D, E>(r: Resource<D, E>) => <T>(
  rf: Resource<(d: D) => T, E>,
): Resource<T, E> => {
  switch (r.tag) {
    case 'initial':
      return isFailure(rf) ? rf : r
    case 'loading':
      return isLoading(rf) ? rf : isSuccess(rf) ? r : rf
    case 'success':
      return isSuccess(rf) ? success(rf.value(r.value)) : rf
    case 'failure':
      return isFailure(rf) ? rf : r
  }
}

export function combine<A, EE>(ra: Resource<A, EE>): Resource<[A], EE>
export function combine<A, B, EE>(
  ra: Resource<A, EE>,
  rb: Resource<B, EE>,
): Resource<[A, B], EE>
export function combine<A, B, C, EE>(
  ra: Resource<A, EE>,
  rb: Resource<B, EE>,
  rc: Resource<C, EE>,
): Resource<[A, B, C], EE>
export function combine<A, B, C, D, EE>(
  ra: Resource<A, EE>,
  rb: Resource<B, EE>,
  rc: Resource<C, EE>,
  rd: Resource<D, EE>,
): Resource<[A, B, C, D], EE>
export function combine<A, B, C, D, E, EE>(
  ra: Resource<A, EE>,
  rb: Resource<B, EE>,
  rc: Resource<C, EE>,
  rd: Resource<D, EE>,
  re: Resource<E, EE>,
): Resource<[A, B, C, D, E], EE>
export function combine<A, B, C, D, E, F, EE>(
  ra: Resource<A, EE>,
  rb: Resource<B, EE>,
  rc: Resource<C, EE>,
  rd: Resource<D, EE>,
  re: Resource<E, EE>,
  rf: Resource<F, EE>,
): Resource<[A, B, C, D, E, F], EE>
export function combine<A, B, C, D, E, F, G, EE>(
  ra: Resource<A, EE>,
  rb: Resource<B, EE>,
  rc: Resource<C, EE>,
  rd: Resource<D, EE>,
  re: Resource<E, EE>,
  rf: Resource<F, EE>,
  rg: Resource<G, EE>,
): Resource<[A, B, C, D, E, F, G], EE>
export function combine<A, B, C, D, E, F, G, H, EE>(
  ra: Resource<A, EE>,
  rb: Resource<B, EE>,
  rc: Resource<C, EE>,
  rd: Resource<D, EE>,
  re: Resource<E, EE>,
  rf: Resource<F, EE>,
  rg: Resource<G, EE>,
  rh: Resource<H, EE>,
): Resource<[A, B, C, D, E, F, G, H], EE>

export function combine<D, E>(...rs: Resource<D, E>[]) {
  let combined = success([]) as Resource<D[], E>

  const appendValue = (values: D[]) => (value: D) => [...values, value]
  for (const r of rs) {
    combined = ap(r)(map(appendValue)(combined))
  }

  return combined
}

export const eq = (r: AnyResource) => (rr: AnyResource) => {
  switch (r.tag) {
    case 'initial':
      return rr.tag === 'initial'
    case 'loading':
      return rr.tag === 'loading'
    case 'success':
      return rr.tag === 'success' && r.value === rr.value
    case 'failure':
      return rr.tag === 'failure' && r.error === rr.error
  }
}

export const toNullable = <D, E>(resource: Resource<D, E>): D | null => {
  return resource.tag === 'success' ? resource.value : null
}

export const toUndefined = <D, E>(resource: Resource<D, E>): D | undefined => {
  return resource.tag === 'success' ? resource.value : undefined
}

export const exists = <D>(f: (value: D) => boolean) => <E>(
  r: Resource<D, E>,
): boolean => {
  return r.tag === 'success' && f(r.value)
}

/**
 * Unsafe method that will return value of type D if the resource is success.
 * Otherwise it will throw an error.
 */
export const extract = <D, E>(r: Resource<D, E>): D => {
  if (r.tag === 'success') {
    return r.value
  }
  throw new Error(`Can't extract value from resource with "${r.tag}" tag`)
}
