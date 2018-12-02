import { Document, model, Schema } from 'mongoose'
import { lgResult } from './sequell/sequell'
import { capitalize } from './utils'

export type GameInfoValues = lgResult & {
  morgue: String
  vod: String
}
export interface GameInfoDocument extends Document, GameInfoValues {}

export const GameInfoSchema = new Schema({
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
  runes: Number,
  points: Number,
  title: String,
  turns: Number,
  xl: Number,
  vod: String,
})

export const GameInfo = model<GameInfoDocument>(
  'Speedrun',
  GameInfoSchema,
  'gameInfos',
  true
)
export type GameInfo = typeof GameInfoSchema

export const SpeedrunByPlayer = model<GameInfoDocument>(
  'Speedrun',
  GameInfoSchema,
  'speedrunsByPlayer',
  true
)
export const SpeedrunByPlayer15Runes = model<GameInfoDocument>(
  'Speedrun',
  GameInfoSchema,
  'speedrunsByPlayer15Runes',
  true
)

export const SpeedrunByBackground = model<GameInfoDocument>(
  'Speedrun',
  GameInfoSchema,
  'speedrunsByBackground',
  true
)

export const SpeedrunByRace = model<GameInfoDocument>(
  'Speedrun',
  GameInfoSchema,
  'speedrunsByRace',
  true
)

export const SpeedrunByGod = model<GameInfoDocument>(
  'Speedrun',
  GameInfoSchema,
  'speedrunsByGod',
  true
)

export const ComboHighscore = model<GameInfoDocument>(
  'Speedrun',
  GameInfoSchema,
  'comboHighscores',
  true
)

export enum AggregationField {
  Player = 'player',
  Player15Runes = 'player15Runes',
  Race = 'race',
  Background = 'background',
  God = 'god',
}

export const Speedruns = {
  [AggregationField.Player]: SpeedrunByPlayer,
  [AggregationField.Player15Runes]: SpeedrunByPlayer15Runes,
  [AggregationField.Race]: SpeedrunByRace,
  [AggregationField.Background]: SpeedrunByBackground,
  [AggregationField.God]: SpeedrunByGod,
}

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
  'runes',
  'points',
  'title',
  'turns',
  'xl',
  'vod',
]
export const getAggregationFieldName = (
  aggregationField: AggregationField
): string =>
  aggregationField === AggregationField.Player15Runes
    ? getAggregationFieldName(AggregationField.Player)
    : aggregationField

export const GameInfoAggregations = {
  aggregateSpeedrunBy: (aggregationField: AggregationField, limit?: number) => {
    const aggregationFieldName = getAggregationFieldName(aggregationField)
    const outCollection = `speedrunsBy${capitalize(aggregationField)}`

    const filter =
      aggregationField === AggregationField.Player15Runes
        ? {
            $match: { runes: { $eq: 15 } },
          }
        : null

    return [
      filter,
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
            _id: { field: `$${aggregationFieldName}`, runes: '$runes' },
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
        $out: outCollection,
      },
    ].filter(Boolean)
  },
}
