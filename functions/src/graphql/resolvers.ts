import { GraphQLDateTime } from 'graphql-iso-date'
import { AggregationField, ComboHighscore, Speedruns } from '../model'

export const resolvers = {
  DateTime: GraphQLDateTime,
  Query: {
    rankings: async (_: any, { by: type }: { by: AggregationField }) => {
      var collection = Speedruns[type]

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
