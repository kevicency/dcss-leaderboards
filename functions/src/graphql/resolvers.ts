import { GraphQLDateTime } from 'graphql-iso-date'
import { Rankings, RankingType } from '../model'

export const resolvers = {
  DateTime: GraphQLDateTime,
  Query: {
    rankings: async (_: any, { by: type }: { by: RankingType }) => {
      var collection = Rankings[type]

      const rankings = collection ? await collection.find() : []

      return rankings.map(x => x.toJSON())
    },
  },
}

export default resolvers
