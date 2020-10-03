// export enum TMachineStates{
//   SELECTING_PROJECT = "Select a Project", 
//   CONFIGURING_PROCESS = "Configure details for the app", 
//   EXECUTING_PROCESS = "App is gathering reports", 
//   IDLING = "App has stopped gathering reports", 
//   COMPLETED = "App has nothing else to do", 
//   DISPLAYING = "App is displaying status for serial number", 
// } 

// export enum TMachineEvents{
//   ON_RESET = "Back to project selection", 
//   ON_START = "Start Gathering reports", 
//   ON_STOP = "Stop Gathering reports", 
//   ON_ARCHIVED = "Zipped Reports", 
//   ON_VIEW = "Look at a serial number", 
//   ON_MONITOR = "Monitoring gathering report", 
//   ON_PROJECT_SELECTED = "Project was selected", 
// } 


export type TAction = (...args: any[]) => string|void
export type TActionReference = {
  isOnEnterAction: boolean,
  isOnExitAction: boolean,
  fromState: string,
  event: string | null,
  index: number
}
// export type TActionHandle = {
//   reference: TActionReference | null
// }
export class TActionHandle{
  private reference: TActionReference | null
  constructor() {
    this.reference = null
  }
  setReference(
    index: number,
    fromState: string,
    isOnEnterAction: boolean = false,
    isOnExitAction: boolean = false,
    event: string | null = null,
  ){
    this.reference = {
      index: index,
      fromState: fromState,
      isOnEnterAction: isOnEnterAction,
      isOnExitAction: isOnExitAction,
      event: event,
    }
  }
  getReference(){
    return (this.reference) ? {...this.reference} : null
  }
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

