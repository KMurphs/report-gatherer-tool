import { StateMachine } from "./machine"
import { TMachineEvents, TMachineStates } from "./types"


let machine: StateMachine<TMachineStates, TMachineStates, TMachineEvents>
beforeAll(()=>{
  // let machine1 = new StateMachine(TMachineStates, { initialState: TMachineStates.SELECTING_PROJECT })
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

  // machine.state(TMachineStates.SELECTING_PROJECT).onEnter.registerAction(()=>void, handle)
  // machine.state(TMachineStates.SELECTING_PROJECT).onExit.registerAction(()=>void, handle)
  // machine.state(TMachineStates.SELECTING_PROJECT).onTransition(TMachineEvents.ON_RESET).registerAction(()=>void, handle)

  machine.state(TMachineStates.SELECTING_PROJECT).onEnter.registerAction(()=>{}, null)
  machine.state(TMachineStates.SELECTING_PROJECT).onTransition(TMachineEvents.ON_PROJECT_SELECTED).registerAction(()=>{}, null)

  machine.handleEvent(TMachineEvents.ON_PROJECT_SELECTED);


  // console.log(machine);

})



describe("Machine State functionality", ()=>{
  test("Dummy", ()=>{
    expect(0).toBe(0);
  })
})