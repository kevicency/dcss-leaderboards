import { format } from 'date-fns'
import * as winston from 'winston'
import serializeError = require('serialize-error')

export interface Logger {
  error: winston.LeveledLogMethod
  warn: winston.LeveledLogMethod
  info: winston.LeveledLogMethod
  verbose: winston.LeveledLogMethod
  debug: winston.LeveledLogMethod
  silly: winston.LeveledLogMethod
}

export const formatError = winston.format(info => {
  if (info.level === 'error' && info.meta) {
    const serialized = serializeError(info.meta)

    info.meta = serialized
  }

  return info
})
export const formatMessage = winston.format(info => {
  if (info.level === 'error' && info.meta && info.meta.stack) {
    info.message = `${info.message || ''} ${info.meta.stack}`.trim()

    delete info.meta
  }

  if (info.meta) {
    delete info.meta
  }

  if (info.label) {
    info.message = `[${info.label}] ${info.message}`

    delete info.label
  }
  if (info.timestamp) {
    const date = new Date(info.timestamp)

    info.message = `${format(date, 'HH:mm:ss.SSS')} ${info.message}`

    delete info.timestamp
  }

  return info
})

export const createLogger = (name: string) => {
  const defaultFormats = [
    winston.format.label({ label: name }),
    winston.format.timestamp(),
    winston.format.splat(),
    formatError(),
  ]
  const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
    format: winston.format.combine(
      ...[...defaultFormats, winston.format.json()]
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          ...[
            ...defaultFormats,
            formatMessage(),
            winston.format.colorize(),
            winston.format.simple(),
          ]
        ),
      }),
      ...(process.env.NODE_ENV !== 'production'
        ? [
            new winston.transports.File({
              filename: './logs/error.log',
              level: 'error',
            }),
            new winston.transports.File({ filename: './logs/debug.log' }),
          ]
        : []),
    ],
  })

  // const wrap = (
  //   logMethod: winston.LeveledLogMethod,
  //   serialize: boolean = false
  // ) => (messageOrObj: any, ...args: any) => {
  //   if (typeof messageOrObj === 'string') {
  //     const message = messageOrObj

  //     logMethod(`[${name}] ${message}`, ...args)
  //   } else {
  //     if (serialize) {
  //       logMethod(`[${name}] ${serializeError(messageOrObj)}`, ...args)
  //     } else {
  //       logMethod(`[${name}]`, messageOrObj, ...args)
  //     }
  //   }
  // }

  // return {
  //   error: wrap(logger.error, true),
  //   warn: wrap(logger.warn),
  //   info: wrap(logger.info),
  //   verbose: wrap(logger.verbose),
  //   debug: wrap(logger.debug),
  //   silly: wrap(logger.silly),
  // }
  return logger
}

export default createLogger(null)
