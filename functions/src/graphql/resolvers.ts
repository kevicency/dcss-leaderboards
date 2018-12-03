import { GraphQLDateTime } from 'graphql-iso-date'
import {
  AggregationField,
  ComboHighscore,
  GameInfo,
  GameInfoAggregations,
  GameInfoValues,
} from '../model'

export const resolvers = {
  DateTime: GraphQLDateTime,
  Query: {
    // speedruns2: async (_: any, { by }: { by: AggregationField }) => {
    //   var Speedrun = Speedruns[by]

    //   const gameInfos: GameInfoDocument[] = Speedrun
    //     ? await Speedrun.find()
    //     : []

    //   return gameInfos.map(x => x.toJSON())
    // },
    speedruns: async (_: any, { by }: { by: AggregationField }) => {
      const aggregations = GameInfoAggregations.aggregateSpeedrunBy(by)
      const gameInfos: GameInfoValues[] = await GameInfo.aggregate(
        aggregations
      ).exec()

      return gameInfos
    },

    comboHighscores: async () => {
      const gameInfos = await ComboHighscore.find().sort('gid')

      return gameInfos.map(x => x.toJSON())
    },
  },
}

export default resolvers
