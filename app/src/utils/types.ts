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
export type TConfig = {
  projectName: string,
  find: TFindConfig,
}