export const inSeries = (asyncFuncs: Array<() => Promise<any>>) =>
  asyncFuncs.reduce((promise, func) => promise.then(func), Promise.resolve())
