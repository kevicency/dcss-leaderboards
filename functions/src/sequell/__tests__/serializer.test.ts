import 'jest'
import { lgQuery, logQuery } from '../sequell'
import { SequellSerializer } from '../serializer'

const sut = new SequellSerializer()

test('serialize character', () => {
  expect(sut.characterSerialize({ race: 'Mi', background: 'Fi' })).toBe('MiFi')
  expect(sut.characterSerialize({ race: 'Hu', background: 'Wn' })).toBe('HuWn')
  expect(sut.characterSerialize({ race: 'Hu', background: null })).toBe('Hu--')
  expect(sut.characterSerialize({ race: null, background: 'Hu' })).toBe('--Hu')
  expect(sut.characterSerialize({ race: 'Fe', background: 'CK' })).toBe('FeCK')
  expect(sut.characterSerialize({ race: 'Fe', background: null })).toBe('Fe--')
  expect(sut.characterSerialize({ race: null, background: 'Fe' })).toBe('--Fe')
})

test('serialize lg', () => {
  const starQuery: lgQuery = {
    type: 'lg',
    race: 'Mi',
    background: 'Fi',
    god: 'Oka',
    min: 'dur',
  }
  const playerQuery = {
    ...starQuery,
    player: 'MeekVeins',
  }
  const blacklistQuery = {
    ...starQuery,
    playerBlacklist: ['manman', 'qw'],
  }

  expect(sut.lgSerialize(starQuery)).toBe('!lg * win x=gid MiFi Oka min=dur')
  expect(sut.lgSerialize(playerQuery)).toBe(
    '!lg MeekVeins win x=gid MiFi Oka min=dur'
  )
  expect(sut.lgSerialize(blacklistQuery)).toBe(
    '!lg * win x=gid MiFi Oka min=dur !@manman !@FastMan !@pureman !@qw'
  )
})

test('serialize log', () => {
  const gid = 'MeekVeins:cur:1234'
  const query: logQuery = {
    type: 'log',
    gid,
  }

  expect(sut.logSerialize(query)).toMatch(`!log * gid=${gid}`)
})

test('serialize', () => {
  const lgQuery = { type: 'lg' } as any
  const logQuery = { type: 'log' } as any

  sut.lgSerialize = jest.fn()
  sut.logSerialize = jest.fn()

  sut.serialize(lgQuery)
  sut.serialize(logQuery)

  expect(sut.lgSerialize).toHaveBeenCalledWith(lgQuery)
  expect(sut.logSerialize).toHaveBeenCalledWith(logQuery)
})
