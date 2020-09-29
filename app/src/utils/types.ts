export type TFindConfig = {
  from: string[],
  regexExpression: string,
  regexPlaceholder: string,
}
export type TFindResult = {
  name: string;
  path: string;
  lastModified: number;
}


export type TTestConfig = {
  cssSelector: string,
  expected: string,
  name: string,
}

export type TTestResult = {
  test: TTestConfig,
  hasPassed: boolean
}
export type TTestsResult = {
  items: TTestResult[],
  hasPassed: boolean
}


export type TConfig = {
  projectName: string,
  find: TFindConfig,
  tests: TTestConfig[]
}