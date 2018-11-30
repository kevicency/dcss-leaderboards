import ApolloClient from 'apollo-boost'

export function createApolloClient() {
  const client = new ApolloClient({
    uri: `${process.env.REACT_APP_GRAPHQL_ENDPOINT}/api/graphql`,
  })

  return client
}
