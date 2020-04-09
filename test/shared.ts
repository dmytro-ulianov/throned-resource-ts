import {initial, loading, success, failure} from '../src/constructors'

export const allResourcesTuple = [
  initial,
  loading,
  success({title: 'Peaky Blinders'}),
  failure(new Error('boom')),
]
