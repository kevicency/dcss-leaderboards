import { playerByAccount } from '../data'
import { KilledResult, lgResult, logResult, SequellResult } from './sequell'

export interface ISequellParser {
  parse(message: string): SequellResult
  lgParse(message: string): lgResult
  logParse(message: string): logResult
  killedParse(message: string): KilledResult
}

export class SequellParser implements ISequellParser {
  lgRegex = /^\d+\. \[game_key=([\w:]+)\] (\w+) the ([\w\s]+) \(L(\d+) (\w+)( of ([\w\s]+))?\), escaped with the Orb and (\d+) runes on ([\d\s-:]+), with (\d+) points after (\d+) turns and ([\d:]+)\./
  logRegex = /^\d+\. (\w+), XL(\d+) (\w+), T:(\d+): (.+)$/
  logDateRegex = /.*(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2}).*/
  timoeutRegex = /\d+s limit exceeded: killed (.+)/

  parse(message: string): SequellResult {
    return (
      this.lgParse(message) ||
      this.logParse(message) ||
      this.killedParse(message)
    )
  }

  lgParse(message: string): lgResult {
    if (message) {
      const match = message.match(this.lgRegex)

      if (match && match.length > 1) {
        return {
          type: 'lg',
          gid: match[1],
          account: match[2],
          player: playerByAccount[match[2]] || match[2],
          title: match[3],
          xl: +match[4],
          ...this.parseCharacter(match[5]),
          god: match[7],
          runes: +match[8],
          date: new Date(`${match[9].replace(' ', 'T')}Z`),
          points: +match[10],
          turns: +match[11],
          duration: match[12],
        }
      }
    }
    return null
  }

  logParse(message: string): logResult {
    if (message) {
      const match = message.match(this.logRegex)

      if (match && match.length > 1) {
        return {
          type: 'log',
          account: match[1],
          xl: +match[2],
          ...this.parseCharacter(match[3]),
          turns: +match[4],
          morgue: match[5],
          date: new Date(
            match[5].replace(this.logDateRegex, '$1-$2-$3 $4:$5:$6Z')
          ),
        }
      }
    }
    return null
  }

  killedParse(message: string): KilledResult {
    if (message) {
      const match = message.match(this.timoeutRegex)

      return {
        type: 'killed',
        message: match[1],
      }
    }

    return null
  }

  parseCharacter(character: string) {
    return character
      ? { race: character.slice(0, 2), background: character.slice(2, 4) }
      : { race: null, background: null }
  }
}
