import { EventEmitter } from 'events'
import * as irc from 'irc'
import { Omit } from 'lodash'
import { createLogger } from '../logger'
import { ISequellParser, SequellParser } from './parser'
import { ISequellSerializer, SequellSerializer } from './serializer'

const logger = createLogger('sequell')

type CharacterQuery = {
  race?: string
  background?: string
  god?: string
}

export type lgQueryFilters = {
  [key: string]: string | number | { op: string; value: string | number }
}
export type lgQuery = CharacterQuery & {
  type: 'lg'
  player?: string
  playerBlacklist?: string[]
  filters?: lgQueryFilters
}

export type logQuery = {
  type: 'log'
  gid: string
}
export type SequellQuery = lgQuery | logQuery

export type lgResult = {
  type: 'lg'
  account: string
  background: string
  date: Date
  duration: string
  gid: string
  god?: string
  player: string
  points: number
  race: string
  title: string
  turns: number
  runes: number
  xl: number
}
export type logResult = {
  type: 'log'
  account: string
  xl: number
  background: string
  race: string
  turns: number
  date: Date
  morgue: string
}
export type KilledResult = {
  type: 'killed'
  message: string
}

export type SequellResult = lgResult | logResult | KilledResult

export interface Sequell extends EventEmitter {
  send(message: string): void
  lg(args: Omit<lgQuery, 'type'>): void
  log(args: Omit<logQuery, 'type'>): void
}

export class IrcSequell extends EventEmitter implements Sequell {
  private irc: irc.Client
  private serializer: ISequellSerializer
  private parser: ISequellParser
  private queue: string[]
  private status: 'initializing' | 'ready' = 'initializing'

  constructor() {
    super()
    this.queue = []
    this.serializer = new SequellSerializer()
    this.parser = new SequellParser()
    this.irc = new irc.Client('irc.freenode.net', 'speedcrawl', {
      port: 6697,
      autoConnect: true,
      autoRejoin: true,
      userName: process.env.IRC_USERNAME,
      password: process.env.IRC_PASSWORD,
      sasl: true,
      secure: true,
      debug: false,
    })
    this.irc.on('message', this.handleIrcMessage)
    this.irc.on('registered', this.handleRegistered)
  }

  private handleIrcMessage = (from: string, to: string, message: string) => {
    logger.debug(`received: ${message}`)

    this.emit('message', from, to, message)

    const result = this.parser.parse(message)

    if (result) {
      this.emit('result', result)
    } else {
      this.emit('unknown-message', from, to, message)
    }
  }

  private handleRegistered = () => {
    this.status = 'ready'

    this.emit('ready')

    if (this.queue.length) {
      do {
        this.send(this.queue.shift())
      } while (this.queue.length)
    }
  }

  public send = (message: string) => {
    if (this.status === 'ready') {
      logger.debug('send: ' + message)

      this.irc.say('sequell', message)
    } else {
      this.queue.push(message)
    }
  }

  lg(query: Omit<lgQuery, 'type'>): void {
    const message = this.serializer.serialize({ type: 'lg', ...query })

    this.send(message)
  }

  log(query: Omit<logQuery, 'type'>): void {
    const message = this.serializer.serialize({ type: 'log', ...query })

    this.send(message)
  }
}
