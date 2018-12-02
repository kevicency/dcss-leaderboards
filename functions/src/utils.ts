export const inSeries = (asyncFuncs: Array<() => Promise<any>>) =>
  asyncFuncs.reduce((promise, func) => promise.then(func), Promise.resolve())

export const capitalize = (input: string) => {
  if (!input) {
    return input
  }

  return input.slice(0, 1).toUpperCase() + input.slice(1)
}
