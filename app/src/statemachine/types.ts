export enum TMachineStates{
  SELECTING_PROJECT = "Select a Project", 
  CONFIGURING_PROCESS = "Configure details for the app", 
  EXECUTING_PROCESS = "App is gathering reports", 
  IDLING = "App has stopped gathering reports", 
  COMPLETED = "App has nothing else to do", 
  DISPLAYING = "App is displaying status for serial number", 
} 

export enum TMachineEvents{
  ON_RESET = "Back to project selection", 
  ON_START = "Start Gathering reports", 
  ON_STOP = "Stop Gathering reports", 
  ON_ARCHIVED = "Zipped Reports", 
  ON_VIEW = "Look at a serial number", 
  ON_MONITOR = "Monitoring gathering report", 
  ON_PROJECT_SELECTED = "Project was selected", 
} 


export type TAction = (...args: any[]) => void
export type TActionReference = {
  isOnEnterAction: boolean,
  isOnExitAction: boolean,
  fromState: string,
  event: string | null,
  index: number
}
export type TActionHandle = {
  reference: TActionReference | null
}
export type TTransition<T, R> = {
  from: T,
  to: T,
  on: R
}
export type TInitializer<T extends string, R extends string> = {
  initialState: T,
  transitions: TTransition<T, R>[]
}

