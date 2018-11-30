import { uniq } from 'lodash'
import { accounts } from '../data'
import { lgQuery, logQuery, SequellQuery } from './sequell'

export interface ISequellSerializer {
  serialize(query: SequellQuery): string
}

export class SequellSerializer implements ISequellSerializer {
  private ambiguousAcronyms = ['Hu', 'Fe', 'FE']

  serialize(query: SequellQuery) {
    if (query.type === 'lg') {
      return this.lgSerialize(query)
    }

    if (query.type === 'log') {
      return this.logSerialize(query)
    }

    return null
  }

  public logSerialize(query: logQuery) {
    return `!log * gid=${query.gid}`
  }

  public lgSerialize(query: lgQuery) {
    let message = `!lg ${query.player ||
      '*'} win x=gid ${this.characterSerialize(query)}`

    if (query.god) {
      message = `${message} ${query.god}`
    }

    if (query.min) {
      message = `${message} min=${query.min}`
    }

    if (query.playerBlacklist) {
      const accountBlacklist = uniq(
        query.playerBlacklist.reduce(
          (memo, player) => [...memo, player, ...(accounts[player] || [])],
          []
        )
      )

      message = `${message} ${accountBlacklist
        .filter(Boolean)
        .map(account => `!@${account}`)
        .join(' ')}`
    }

    return message.replace(/\s+/g, ' ')
  }

  public characterSerialize({
    race,
    background,
  }: { race?: string; background?: string } = {}) {
    for (const acronym of this.ambiguousAcronyms) {
      if (race === acronym && !background) {
        return `${race}--`
      }
      if (background === acronym && !race) {
        return `--${background}`
      }
    }

    return `${race || ''}${background || ''}`
  }
}
