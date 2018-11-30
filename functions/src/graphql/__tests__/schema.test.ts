import { graphql } from 'graphql'
import { mockServer } from 'graphql-tools'
import { schema } from '..'

const testCaseA = {
  id: 'Test Case A',
  query: `
    query {
      rankings(by: player) {
         gid
      }
    }
  `,
  variables: {},
  context: {},
  expected: { data: { rankings: [] as any[] } },
}

describe('Schema', () => {
  // Array of case types
  const cases = [testCaseA]

  test('has valid type definitions', async () => {
    expect(async () => {
      const MockServer = mockServer(schema, {
        Query: () => ({
          rankings: () => [] as any[],
        }),
        Boolean: () => false,
        ID: () => '1',
        Int: () => 1,
        Float: () => 12.34,
        String: () => 'Foo',
      })

      await MockServer.query(`{ __schema { types { name } } }`)
    }).not.toThrow()
  })

  cases.forEach(obj => {
    const { id, query, variables, context: ctx, expected } = obj
    test(`query: ${id}`, async () => {
      return await expect(
        graphql(schema, query, null, { ctx }, variables)
      ).resolves.toEqual(expected)
    })
  })
})
