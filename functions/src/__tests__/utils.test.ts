import { capitalize } from '../utils'

test('capitalize', () => {
  expect(capitalize(null)).toBeNull()
  expect(capitalize('')).toBe('')
  expect(capitalize('a')).toBe('A')
  expect(capitalize('foo')).toBe('Foo')
  expect(capitalize('fooBar')).toBe('Foobar')
})
