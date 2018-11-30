import {
  ITheme,
  loadTheme as loadFabricTheme,
} from 'office-ui-fabric-react/lib/Styling'

type Theme = ITheme & {
  space?: number[]
  breakpoints?: number[]
}

export { Theme }

export const loadTheme = (fabricOverrides: Partial<ITheme> = {}): Theme => ({
  ...loadFabricTheme(fabricOverrides),
  breakpoints: [32, 48, 64],
  space: [0, 6, 12, 18, 24],
})

export default loadTheme()
