import {Resource} from './types'
import {success, failure} from './constructors'
import {isSuccess, isFailure} from './type-guards'

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
