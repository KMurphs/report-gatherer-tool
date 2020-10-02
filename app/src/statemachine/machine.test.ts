import { StateMachine } from "./machine"
import { TMachineEvents, TMachineStates } from "./types"

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
    
  machine.state(TMachineStates.SELECTING_PROJECT).onExit.registerAction(()=> `Action ${counter++}`)
  machine.state(TMachineStates.SELECTING_PROJECT).onExit.registerAction(()=> `Action ${counter++}`)
  machine.state(TMachineStates.SELECTING_PROJECT).onTransition(TMachineEvents.ON_PROJECT_SELECTED).registerAction(()=> `Action ${counter++}`)
  machine.state(TMachineStates.SELECTING_PROJECT).onTransition(TMachineEvents.ON_PROJECT_SELECTED).registerAction(()=> `Action ${counter++}`)
  machine.state(TMachineStates.CONFIGURING_PROCESS).onEnter.registerAction(()=> `Action ${counter++}`)
  machine.state(TMachineStates.CONFIGURING_PROCESS).onEnter.registerAction(()=> {})


  return machine;
}

beforeAll(()=>{
  // let machine1 = new StateMachine(TMachineStates, { initialState: TMachineStates.SELECTING_PROJECT })
})



describe("Machine State functionality", ()=>{
  test("Will execute actions from onEnter, onExit and Transition. Will update current state", ()=>{

    let machine = getMachine();
    let res = machine.handleEvent(TMachineEvents.ON_PROJECT_SELECTED);

    expect(res.length).toBe(6);
    expect(machine.getCurrentState()).toBe(TMachineStates.CONFIGURING_PROCESS);
    res.forEach((r, i)=> expect(r).toBe(i < 5 ? `Action ${i}` : undefined));
  })

  test("Will not handle events not registered with current state", ()=>{
    let machine = getMachine();
    expect(()=>machine.handleEvent(TMachineEvents.ON_VIEW)).toThrowError(TypeError);
  })
})