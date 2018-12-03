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

  enum AggregationType {
    player
    race
    background
    god
  }

  enum HighscoreType {
    combo
    player
  }

  type Query {
    rtSpeedruns(by: AggregationType!, allRunes: Boolean): [GameInfo]
    tcSpeedruns: [GameInfo]
    highscores(by: HighscoreType!): [GameInfo]
  }
`
export default typeDefs
