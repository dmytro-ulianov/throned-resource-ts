import {Resource, Initial, Loading} from 'types'

export enum tag {
  initial = 'initial',
  loading = 'loading',
  success = 'success',
  failure = 'failure',
}

const initial: Initial = {tag: tag.initial}
const loading: Loading = {tag: tag.loading}
const success = <D>(value: D): Resource<D> => ({tag: tag.success, value})
const failure = <E>(error: E): Resource<any, E> => ({tag: tag.failure, error})
const of = <D, E = any>(d: D): Resource<D, E> => success(d)

export {initial, loading, success, failure, of}

const fromNullable = <D, E = any>(a: D | null | undefined): Resource<D, E> => {
  return a == null ? initial : of(a)
}

const tryCatch = <D, E = any>(f: () => D): Resource<D, E> => {
  try {
    return of(f())
  } catch (e) {
    return failure(e)
  }
}

const toNullable = <D, E>(resource: Resource<D, E>): D | null => {
  return resource.tag === 'success' ? resource.value : null
}

const toUndefined = <D, E>(resource: Resource<D, E>): D | undefined => {
  return resource.tag === 'success' ? resource.value : undefined
}

export {fromNullable, tryCatch, toNullable, toUndefined}
