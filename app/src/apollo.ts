import ApolloClient from 'apollo-boost'

export const uri = `${process.env.REACT_APP_GRAPHQL_ENDPOINT}/api/graphql`

export function createApolloClient() {
  const client = new ApolloClient({
    uri,
  })

  return client
}
