import gql from 'graphql-tag'

export const typeDefs = gql`
  scalar DateTime

  type GameInfo {
    account: String!
    background: String!
    date: DateTime!
    duration: String!
    gid: ID!
    god: String
    morgue: String
    player: String!
    race: String!
    runes: Int!
    points: Int!
    title: String!
    turns: Int!
    xl: Int!
    vod: String
  }

  enum AggregationField {
    player
    player15Runes
    race
    background
    god
  }

  type Query {
    speedruns(by: AggregationField!): [GameInfo]
    comboHighscores: [GameInfo]
  }
`
export default typeDefs
