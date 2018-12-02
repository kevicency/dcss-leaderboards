import { GraphQLDateTime } from 'graphql-iso-date'
import { AggregationField, ComboHighscore, Speedruns } from '../model'

export const resolvers = {
  DateTime: GraphQLDateTime,
  Query: {
    speedruns: async (_: any, { by: type }: { by: AggregationField }) => {
      var Speedrun = Speedruns[type]

      const gameInfos = Speedrun ? await Speedrun.find() : []

      return gameInfos.map(x => x.toJSON())
    },
    comboHighscores: async () => {
      const gameInfos = await ComboHighscore.find().sort('gid')

      return gameInfos.map(x => x.toJSON())
    },
  },
}

export default resolvers
