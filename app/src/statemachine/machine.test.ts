import { StateMachine } from "./machine"
import { TActionHandle } from "./types";



enum TMachineStates{
  SELECTING_PROJECT = "Select a Project", 
  CONFIGURING_PROCESS = "Configure details for the app", 
  EXECUTING_PROCESS = "App is gathering reports", 
  IDLING = "App has stopped gathering reports", 
  COMPLETED = "App has nothing else to do", 
  DISPLAYING = "App is displaying status for serial number", 
} 

enum TMachineEvents{
  ON_RESET = "Back to project selection", 
  ON_START = "Start Gathering reports", 
  ON_STOP = "Stop Gathering reports", 
  ON_ARCHIVED = "Zipped Reports", 
  ON_VIEW = "Look at a serial number", 
  ON_MONITOR = "Monitoring gathering report", 
  ON_PROJECT_SELECTED = "Project was selected", 
} 








const getMachine = (): StateMachine<TMachineStates, TMachineStates, TMachineEvents> => {
  
  let machine: StateMachine<TMachineStates, TMachineStates, TMachineEvents>

  machine = new StateMachine(TMachineStates, {
    initialState: TMachineStates.SELECTING_PROJECT,
    transitions: [
      { from: TMachineStates.SELECTING_PROJECT,       to: TMachineStates.CONFIGURING_PROCESS,         on: TMachineEvents.ON_PROJECT_SELECTED }, 
      { from: TMachineStates.CONFIGURING_PROCESS,     to: TMachineStates.SELECTING_PROJECT,           on: TMachineEvents.ON_RESET }, 
      { from: TMachineStates.CONFIGURING_PROCESS,     to: TMachineStates.EXECUTING_PROCESS,           on: TMachineEvents.ON_START }, 
      { from: TMachineStates.EXECUTING_PROCESS,       to: TMachineStates.DISPLAYING,                  on: TMachineEvents.ON_VIEW }, 
      { from: TMachineStates.EXECUTING_PROCESS,       to: TMachineStates.SELECTING_PROJECT,           on: TMachineEvents.ON_RESET }, 
      { from: TMachineStates.EXECUTING_PROCESS,       to: TMachineStates.IDLING,                      on: TMachineEvents.ON_STOP }, 
      { from: TMachineStates.DISPLAYING,              to: TMachineStates.EXECUTING_PROCESS,           on: TMachineEvents.ON_MONITOR }, 
      { from: TMachineStates.IDLING,                  to: TMachineStates.COMPLETED,                   on: TMachineEvents.ON_ARCHIVED }, 
      { from: TMachineStates.COMPLETED,               to: TMachineStates.SELECTING_PROJECT,           on: TMachineEvents.ON_RESET }, 
    ]
  });

  let counter: number = 0;
    
  machine.state(TMachineStates.SELECTING_PROJECT).onExit.registerAction(()=> `Action 0`);
  machine.state(TMachineStates.SELECTING_PROJECT).onExit.registerAction(()=> `Action 1`);
  machine.state(TMachineStates.SELECTING_PROJECT).onTransition(TMachineEvents.ON_PROJECT_SELECTED).registerAction(()=> `Action 2`);
  machine.state(TMachineStates.SELECTING_PROJECT).onTransition(TMachineEvents.ON_PROJECT_SELECTED).registerAction(()=> `Action 3`);
  machine.state(TMachineStates.CONFIGURING_PROCESS).onEnter.registerAction(()=> `Action 4`);
  machine.state(TMachineStates.CONFIGURING_PROCESS).onEnter.registerAction(()=> {})


  return machine;
}

beforeAll(()=>{
  // let machine1 = new StateMachine(TMachineStates, { initialState: TMachineStates.SELECTING_PROJECT })
})



describe("Machine State functionality", ()=>{
  test("Will execute actions from onExit first state, Transition and onEnter next state in order", ()=>{

    let machine = getMachine();
    let res = machine.handleEvent(TMachineEvents.ON_PROJECT_SELECTED);

    expect(res.length).toBe(6);
    res.forEach((r, i)=> expect(r).toBe(i < 5 ? `Action ${i}` : undefined));
  })
  test("Will update current state", ()=>{

    let machine = getMachine();
    machine.handleEvent(TMachineEvents.ON_PROJECT_SELECTED);
    expect(machine.getCurrentState()).toBe(TMachineStates.CONFIGURING_PROCESS);
  })
  test("Will not handle events not registered with current state", ()=>{

    let machine = getMachine();
    expect(()=>machine.handleEvent(TMachineEvents.ON_VIEW)).toThrowError(TypeError);
  })
  test("Can Move back and forth between states on event", ()=>{

    let machine = getMachine();

    machine.handleEvent(TMachineEvents.ON_PROJECT_SELECTED);
    expect(machine.getCurrentState()).toBe(TMachineStates.CONFIGURING_PROCESS);
    machine.handleEvent(TMachineEvents.ON_RESET);
    expect(machine.getCurrentState()).toBe(TMachineStates.SELECTING_PROJECT);
  })
  test("Correctly sets initial state", ()=>{

    let machine = getMachine();
    expect(machine.getCurrentState()).toBe(TMachineStates.SELECTING_PROJECT);
  })
  test("Can unregister Action", ()=>{

    let machine = getMachine();
    let testMsg = `Extra Action`

    // first state to second state
    let res = machine.handleEvent(TMachineEvents.ON_PROJECT_SELECTED);
    expect(res.length).toBe(6);
    res.forEach((r, i)=> expect(r).toBe(i < 5 ? `Action ${i}` : undefined));
    expect(machine.getCurrentState()).toBe(TMachineStates.CONFIGURING_PROCESS);

    // Add extra action
    let handle = new TActionHandle()
    machine.state(TMachineStates.CONFIGURING_PROCESS).onExit.registerAction(()=>testMsg, handle)

    // reset back to first state
    res = machine.handleEvent(TMachineEvents.ON_RESET);
    expect(res.length).toBe(1);
    expect(res[0]).toBe(testMsg);
    expect(machine.getCurrentState()).toBe(TMachineStates.SELECTING_PROJECT);

    // Move to second state again
    res = machine.handleEvent(TMachineEvents.ON_PROJECT_SELECTED);
    expect(res.length).toBe(6);
    res.forEach((r, i)=> expect(r).toBe(i < 5 ? `Action ${i}` : undefined));
    expect(machine.getCurrentState()).toBe(TMachineStates.CONFIGURING_PROCESS);

    // remove extra action
    machine.unregisterAction(handle);

    // Mve back to first state
    res = machine.handleEvent(TMachineEvents.ON_RESET);
    expect(res.length).toBe(1);
    expect(res[0]).toBe(undefined);
    expect(machine.getCurrentState()).toBe(TMachineStates.SELECTING_PROJECT);
  })
})