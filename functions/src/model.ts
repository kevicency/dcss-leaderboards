import { Document, model, Schema } from 'mongoose'
import { lgResult } from './sequell/sequell'

export type Speedrun = lgResult & {
  morgue: String
  vod: String
}
export interface SpeedrunDocument extends Document {}

export const SpeedrunSchema = new Schema({
  account: String,
  background: String,
  date: Date,
  duration: String,
  gid: {
    type: String,
    index: true,
  },
  god: String,
  morgue: String,
  player: String,
  race: String,
  points: Number,
  title: String,
  turns: Number,
  xl: Number,
  vod: String,
})

export const Speedrun = model<SpeedrunDocument>(
  'Speedrun',
  SpeedrunSchema,
  'speedruns',
  true
)
export const RankingByPlayer = model<SpeedrunDocument>(
  'Speedrun',
  SpeedrunSchema,
  'rankingsByPlayer',
  true
)
export const RankingByBackground = model<SpeedrunDocument>(
  'Speedrun',
  SpeedrunSchema,
  'rankingsByBackground',
  true
)

export const RankingByRace = model<SpeedrunDocument>(
  'Speedrun',
  SpeedrunSchema,
  'rankingsByRace',
  true
)

export const RankingByGod = model<SpeedrunDocument>(
  'Speedrun',
  SpeedrunSchema,
  'rankingsByGod',
  true
)

export enum RankingType {
  Player = 'player',
  Race = 'race',
  Background = 'background',
  God = 'god',
}

export const Rankings = {
  [RankingType.Player]: RankingByPlayer,
  [RankingType.Race]: RankingByRace,
  [RankingType.Background]: RankingByBackground,
  [RankingType.God]: RankingByGod,
}

export const rankingTypeToField = (type: RankingType) => type
const fieldNames = [
  'account',
  'background',
  'date',
  'duration',
  'gid',
  'god',
  'morgue',
  'player',
  'race',
  'points',
  'title',
  'turns',
  'xl',
  'vod',
]

export const SpeedrunAggregations = {
  generateRankingsBy: (type: RankingType, limit?: number) => {
    const field = rankingTypeToField(type)

    return [
      {
        $sort: {
          duration: 1,
        },
      },
      {
        $group: fieldNames.reduce(
          (memo, fieldName) => {
            memo[fieldName] = { $first: `$${fieldName}` }

            return memo
          },
          {
            _id: `$${field}`,
          }
        ),
      },
      // Cosmos DB doesn't support $replaceRoot
      // {
      //   $replaceRoot: {
      //     newRoot: '$doc',
      //   },
      // },
      // {
      //   $project: [
      //     'account',
      //     'background',
      //     'date',
      //     'duration',
      //     'gid',
      //     'god',
      //     'morgue',
      //     'player',
      //     'race',
      //     'points',
      //     'title',
      //     'turns',
      //     'xl',
      //     'vod',
      //   ].reduce((memo, x) => {
      //     memo[x] = `$doc.${x}`

      //     return memo
      //   }, {}),
      // },
      {
        $sort: {
          duration: 1,
        },
      },
      ...(limit
        ? [
            {
              $limit: limit,
            },
          ]
        : []),
      {
        $out: `rankingsBy${field[0].toUpperCase()}${field.slice(1)}`,
      },
    ]
  },
}
