import { Document, model, Schema } from 'mongoose'
import { lgResult } from './sequell/sequell'

export type GameInfoValues = lgResult & {
  morgue: String
  vod: String
}
export interface GameInfoDocument extends Document, GameInfoValues {}

export const GameInfoSchema = new Schema({
  account: String,
  background: String,
  date: Date,
  duration: {
    type: String,
    index: true,
  },
  gid: {
    type: String,
    index: true,
  },
  god: {
    type: String,
    required: false,
  },
  morgue: String,
  player: String,
  race: String,
  runes: {
    type: Number,
    index: true,
  },
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
    ].filter(Boolean)
  },
}
