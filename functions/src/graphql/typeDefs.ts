import gql from 'graphql-tag'

export const typeDefs = gql`
  scalar DateTime

  type Speedrun {
    account: String!
    background: String!
    date: DateTime!
    duration: String!
    gid: ID!
    god: String
    morgue: String
    player: String!
    race: String!
    points: Int!
    title: String!
    turns: Int!
    xl: Int!
    vod: String
  }

  enum RankingType {
    player
    race
    background
    god
  }

  type Query {
    rankings(by: RankingType!): [Speedrun]
    comboHighscores: [Speedrun]
  }
`
export default typeDefs
