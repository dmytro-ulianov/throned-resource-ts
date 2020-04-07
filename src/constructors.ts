import {Resource, Initial, Loading, Success, Failure} from './types'

export enum tag {
  initial = 'initial',
  loading = 'loading',
  success = 'success',
  failure = 'failure',
}

export const initial: Initial = {tag: tag.initial}
export const loading: Loading = {tag: tag.loading}
export const success = <D>(value: D): Success<D> => ({tag: tag.success, value})
export const failure = <E>(error: E): Failure<E> => ({tag: tag.failure, error})

export const of = <D, E = any>(d: D): Resource<D, E> => success(d)

export const fromNullable = <D, E = any>(
  a: D | null | undefined,
): Resource<D, E> => {
  return a == null ? initial : of(a)
}

export const tryCatch = <D, E = any>(f: () => D): Resource<D, E> => {
  try {
    return of(f())
  } catch (e) {
    return failure(e)
  }
}

export const toNullable = <D, E>(resource: Resource<D, E>): D | null => {
  return resource.tag === 'success' ? resource.value : null
}

export const toUndefined = <D, E>(resource: Resource<D, E>): D | undefined => {
  return resource.tag === 'success' ? resource.value : undefined
}
