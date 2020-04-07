import {Initial, Loading, Failure, Success, AnyResource} from './types'
import {tag} from './constructors'

const isInitial = (r: AnyResource): r is Initial => r.tag === tag.initial
const isLoading = (r: AnyResource): r is Loading => r.tag === tag.loading
const isSuccess = (r: AnyResource): r is Success<any> => r.tag === tag.success
const isFailure = (r: AnyResource): r is Failure<any> => r.tag === tag.failure

const is = {
  initial: isInitial,
  loading: isLoading,
  success: isSuccess,
  failure: isFailure,
}

export {is, isInitial, isLoading, isSuccess, isFailure}
