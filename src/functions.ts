import {Resource} from './types'
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

export const chain = <D, T>(f: (d: D) => Resource<T>) => <E>(
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
