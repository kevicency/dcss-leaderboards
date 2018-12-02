import { GraphQLDateTime } from 'graphql-iso-date'
import {
  AggregationField,
  ComboHighscore,
  GameInfoDocument,
  Speedruns,
} from '../model'

export const resolvers = {
  DateTime: GraphQLDateTime,
  Query: {
    speedruns: async (_: any, { by }: { by: AggregationField }) => {
      var Speedrun = Speedruns[by]

      const gameInfos: GameInfoDocument[] = Speedrun
        ? await Speedrun.find()
        : []

      return gameInfos.map(x => x.toJSON())
    },
    comboHighscores: async () => {
      const gameInfos = await ComboHighscore.find().sort('gid')

      return gameInfos.map(x => x.toJSON())
    },
  },
}

export default resolvers
