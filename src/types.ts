export type Tag = 'initial' | 'loading' | 'success' | 'failure'

export type Initial = {tag: 'initial'}
export type Loading = {tag: 'loading'}
export type Success<D> = {tag: 'success'; value: D}
export type Failure<E> = {tag: 'failure'; error: E}

export type Resource<D, E> = Initial | Loading | Success<D> | Failure<E>

export type AnyResource = Resource<any, any>
