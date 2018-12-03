import * as $ from 'cheerio'
import * as request from 'request-promise'
import * as data from './data'
import { GameInfoValues } from './model'

export interface Scraper {
  fetchComboHighscores(): Promise<GameInfoValues[]>
}
export class WebScraper implements Scraper {
  private parser = new ComboHighscoreParser()

  async fetchComboHighscores() {
    const html: string = await request(
      'http://crawl.akrasiac.org/scoring/top-combo-scores.html'
    )

    return this.parser.parse(html)
  }
}

export class ComboHighscoreParser {
  private morgueRegex = /.*href="(.*)">.*/

  public parse(html: string): GameInfoValues[] {
    const $html = $(html)

    const $rows = $html.find('table.bordered tr').toArray()

    return $rows.map(this.parseRow).filter(Boolean)
  }

  private parseRow = ($row: CheerioElement): GameInfoValues => {
    const $tds = $row.children.filter(x => x.name === 'td')

    if ($tds.length === 0) {
      return null
    }

    const values = $tds.map(x => $(x).text())
    const combo = values[2]
    const race = combo.slice(0, 2)
    const cls = combo.slice(2, 4)

    if (
      data.races.indexOf(race) === -1 ||
      data.backgrounds.indexOf(cls) === -1 ||
      data.comboBlacklist.indexOf(combo) !== -1
    ) {
      return null
    }

    const morgue = $($tds[1])
      .html()
      .replace(this.morgueRegex, '$1')

    return {
      account: values[3],
      background: cls,
      date: new Date(values[12].replace(' ', 'T') + 'Z'),
      duration: values[10].replace(/^(\d):/, '0$1:'),
      gid: values[2],
      god: values[4],
      morgue: morgue,
      player: data.playerByAccount[values[3]] || values[3],
      points: +values[1].replace(/,/g, ''),
      race: race,
      title: values[5],
      turns: +values[9].replace(/,/g, ''),
      vod: '',
      xl: +values[8],
    } as any
  }
}
