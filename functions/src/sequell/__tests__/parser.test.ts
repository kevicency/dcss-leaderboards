import 'jest'
import { SequellParser } from '../parser'
import { lgResult } from '../sequell'

const sut = new SequellParser()

test('parse lg', () => {
  const simple =
    '80123. [game_key=idfk:cao:20180603195308S] idfk the Impregnable (L27 DDFi of Makhleb), escaped with the Orb and 3 runes on 2018-07-03 20:21:30, with 1998358 points after 52035 turns and 0:27:40.'

  expect(sut.lgParse(simple)).toMatchObject({
    account: 'idfk',
    background: 'Fi',
    date: new Date('2018-07-03T20:21:30.000Z'),
    duration: '0:27:40',
    gid: 'idfk:cao:20180603195308S',
    god: 'Makhleb',
    player: 'idfk',
    points: 1998358,
    race: 'DD',
    title: 'Impregnable',
    turns: 52035,
    type: 'lg',
    xl: 27,
  } as lgResult)

  const multiWordTitle =
    '80417. [game_key=P0WERM0DE:cue:20180712164931S] P0WERM0DE the Champion of Chaos (L22 DDFi of Makhleb), escaped with the Orb and 3 runes on 2018-08-17 10:01:22, with 3745092 points after 18326 turns and 0:23:13.'
  expect(sut.lgParse(multiWordTitle)).toMatchObject({
    title: 'Champion of Chaos',
  })

  const multiWordGod =
    '1543. [game_key=Sharkman1231:cbro:20180909034635S] Sharkman1231 the Impregnable (L26 DsMo of Nemelex Xobeh), escaped with the Orb and 3 runes on 2018-10-09 06:08:18, with 1738011 points after 63387 turns and 2:07:25.'
  expect(sut.lgParse(multiWordGod)).toMatchObject({
    god: 'Nemelex Xobeh',
  })
})

test('parse log', () => {
  const log =
    '1. pureman, XL21 MiFi, T:24605: https://s3-us-west-2.amazonaws.com/crawl.jorgrun.rocks/morgue/pureman/morgue-pureman-20180807-003530.txt'
  expect(sut.logParse(log)).toMatchObject({
    account: 'pureman',
    background: 'Fi',
    date: new Date('2018-08-07T00:35:30.000Z'),
    morgue:
      'https://s3-us-west-2.amazonaws.com/crawl.jorgrun.rocks/morgue/pureman/morgue-pureman-20180807-003530.txt',
    race: 'Mi',
    turns: 24605,
    type: 'log',
    xl: 21,
  })
})
