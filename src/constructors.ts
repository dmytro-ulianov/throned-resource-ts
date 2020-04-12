import {Initial, Loading, Success, Failure} from './types'

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

export const of = <D>(d: D): Success<D> => success(d)

export const fromNullable = <D>(
  a: D | null | undefined,
): Initial | Success<D> => {
  return a == null ? initial : of(a)
}

export const tryCatch = <D, E = unknown>(
  f: () => D,
): Success<D> | Failure<E> => {
  try {
    return of(f())
  } catch (e) {
    return failure(e)
  }
}
