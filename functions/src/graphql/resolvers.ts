import { GraphQLDateTime } from 'graphql-iso-date'
import {
  aggregateGameInfos,
  AggregationType,
  ComboHighscore,
  GameInfo,
  GameInfoValues,
} from '../model'

export const resolvers = {
  DateTime: GraphQLDateTime,
  Query: {
    rtSpeedruns: async (
      _: any,
      { by, allRunes }: { by: AggregationType; allRunes?: boolean }
    ) => {
      const limit = by === AggregationType.Player ? 25 : undefined
      const aggregations = aggregateGameInfos({ duration: 1 }, by, {
        limit,
        allRunes,
      })
      const gameInfos: GameInfoValues[] = await GameInfo.aggregate(
        aggregations
      ).exec()

      return gameInfos
    },
    tcSpeedruns: async () => {
      const aggregations = aggregateGameInfos(
        { turns: 1 },
        AggregationType.Player,
        {
          limit: 25,
        }
      )
      const gameInfos: GameInfoValues[] = await GameInfo.aggregate(
        aggregations
      ).exec()

      return gameInfos
    },

    highscores: async () => {
      const gameInfos = await ComboHighscore.find().sort('gid')

      return gameInfos.map(x => x.toJSON())
    },
  },
}

export default resolvers
