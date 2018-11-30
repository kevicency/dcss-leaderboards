import 'jest'
import { RankingType, SpeedrunAggregations } from '../model'

test('aggregation projection', () => {
  const aggregations = SpeedrunAggregations.generateRankingsBy(
    RankingType.Player
  )

  const projection = aggregations.find(x => !!x['$project'])

  expect(projection).toMatchObject({ account: '$doc.account' })
})
