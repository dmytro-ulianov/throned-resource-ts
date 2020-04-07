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

// const bimap = <D, E, T, EE>(map: (d: D) => T, mapError: (e: E) => EE) => (
//   r: Resource<D, E>,
// ): Resource<T, EE> => {
//   if (isSuccess(r)) return success(map(r.value))
//   if (isFailure(r)) return failure(mapError(r.error))
//   return r
// }

// const chain = <D, T>(f: (d: D) => Resource<T>) => (
//   r: Resource<D>,
// ): Resource<T> => {
//   return isSuccess(r) ? f(r.value) : r
// }

// const tap = () => {
//   throw new Error('not implemented')
// }

// const tapError = () => {
//   throw new Error('not implemented')
// }

// const tapAll = () => {
//   throw new Error('not implemented')
// }

// const ap = () => {
//   throw new Error('not implemented')
// }

// const fold = () => {
//   throw new Error('not implemented')
// }

// const cata = () => {
//   throw new Error('not implemented')
// }

// const getOrElse = () => {
//   throw new Error('not implemented')
// }

// const alt = () => {
//   throw new Error('not implemented')
// }

// const recover = () => {
//   throw new Error('not implemented')
// }
