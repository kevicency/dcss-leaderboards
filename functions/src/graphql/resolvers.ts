import { GraphQLDateTime } from 'graphql-iso-date'
import { ComboHighscore, Rankings, RankingType } from '../model'

export const resolvers = {
  DateTime: GraphQLDateTime,
  Query: {
    rankings: async (_: any, { by: type }: { by: RankingType }) => {
      var collection = Rankings[type]

      const rankings = collection ? await collection.find() : []

      return rankings.map(x => x.toJSON())
    },
    comboHighscores: async () => {
      const values = await ComboHighscore.find().sort('gid')

      return values.map(x => x.toJSON())
    },
  },
}

export default resolvers
