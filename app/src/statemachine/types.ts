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

//Function or ()=>void
export type TMachineStateData = {
  transitions: { [key: string]: TMachineTransitionData },
  onEnterActions: ((...args: any[]) => void)[],
  onExitActions: ((...args: any[]) => void)[],
} 
export type TMachineTransitionData = {
  destination: string,
  actions: ((...args: any[]) => void)[],
} 

export type TMachineDefinition = { [key: string]: TMachineStateData }
