import {Tag, Resource} from 'types'

/**
 * Experimental ResourceX with additional reloading constructor
 */
export type TagX = Tag | 'reloading'
export type Reloading = {tag: 'reloading'}
export type ResourceX<D, E = any> = Resource<D, E> | Reloading
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
