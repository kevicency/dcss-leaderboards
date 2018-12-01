import * as grid from '@rebass/grid'
import { Omit } from 'lodash'
import { IRawStyle } from 'office-ui-fabric-react/lib/Styling'
import * as styledComponents from 'styled-components'
import { ThemedStyledComponentsModule } from 'styled-components'
import { Theme } from './theme'

const {
  default: styled,
  css,
  keyframes,
  ThemeProvider,
} = (styledComponents as any) as ThemedStyledComponentsModule<Theme>

export type BoxComponentWithTheme = styledComponents.StyledComponent<
  React.ForwardRefExoticComponent<
    Partial<Omit<grid.CommonProps, 'theme'> & grid.BoxProps & { theme?: Theme }>
  >,
  Theme
>
export type FlexComponentWithTheme = styledComponents.StyledComponent<
  React.ForwardRefExoticComponent<
    Partial<
      Omit<grid.CommonProps, 'theme'> & grid.FlexProps & { theme?: Theme }
    >
  >,
  Theme
>

const Box = grid.Box as BoxComponentWithTheme
const Flex = grid.Flex as FlexComponentWithTheme

export default styled
export { css, keyframes, ThemeProvider }
export { Flex, Box }

export function cssify(style: IRawStyle) {
  return Object.keys(style)
    .map(key => {
      const cssKey = key.replace(/[A-Z]/g, x => `-${x.toLowerCase()}`)

      return `${cssKey}: ${(style as any)[key]};`
    })
    .join('\n')
}

const breakpoints = {
  medium: 42,
  small: 26,
} as { [key: string]: number }
type MediaQuery = (...args: any[]) => styledComponents.InterpolationValue[]
interface Media {
  small: MediaQuery
  medium: MediaQuery
}
export const media = Object.keys(breakpoints).reduce(
  (acc, bp) => {
    acc[bp] = (arg: any, ...args: any[]) => css`
      @media (min-width: ${breakpoints[bp]}em) {
        ${css(arg, ...args)};
      }
    `
    return acc
  },
  {} as any
) as Media

export const mixins = {
  truncate: (width: number | string) => `
  width: ${typeof width === 'string' ? width : `${width}px`};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`,
}
