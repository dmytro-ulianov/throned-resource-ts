import {Resource} from './types'
import {success} from './constructors'
import {isSuccess} from './type-guards'

const map = <D, T>(f: (d: D) => T) => (r: Resource<D>): Resource<T> => {
  return isSuccess(r) ? success(f(r.value)) : r
}

export {map}
