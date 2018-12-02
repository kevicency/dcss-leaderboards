import * as fs from 'fs'
import * as path from 'path'
import * as data from '../data'
import { ComboHighscoreParser } from '../scraper'

const sut = new ComboHighscoreParser()

describe('ComboHighscoreParser', async () => {
  test('parse', () => {
    const html = fs.readFileSync(
      path.join(__dirname, 'combo-highscores.htm'),
      'utf8'
    )

    const result = sut.parse(html)

    expect(result).toBeTruthy()
    expect(result.length).toBe(data.races.length * data.backgrounds.length - 7)
  })
})
