import {
  is,
  isInitial,
  isLoading,
  isFailure,
  isSuccess,
} from '../src/type-guards'
import {initial, loading, success, failure} from '../src/constructors'

const successR = success({title: 'Peaky Blinders'})
const failureR = failure(new Error('boom'))

test('is', () => {
  expect(is.initial).toBe(isInitial)
  expect(is.loading).toBe(isLoading)
  expect(is.success).toBe(isSuccess)
  expect(is.failure).toBe(isFailure)
})

test('initial', () => {
  expect(is.initial(initial)).toBe(true)
  expect(is.initial(loading)).toBe(false)
  expect(is.initial(successR)).toBe(false)
  expect(is.initial(failureR)).toBe(false)
})

test('loading', () => {
  expect(is.loading(initial)).toBe(false)
  expect(is.loading(loading)).toBe(true)
  expect(is.loading(successR)).toBe(false)
  expect(is.loading(failureR)).toBe(false)
})

test('success', () => {
  expect(is.success(initial)).toBe(false)
  expect(is.success(loading)).toBe(false)
  expect(is.success(successR)).toBe(true)
  expect(is.success(failureR)).toBe(false)
})

test('failure', () => {
  expect(is.failure(initial)).toBe(false)
  expect(is.failure(loading)).toBe(false)
  expect(is.failure(successR)).toBe(false)
  expect(is.failure(failureR)).toBe(true)
})
