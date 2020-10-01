import {StateMachine} from "./machine"
import { TMachineEvents, TMachineStates } from "./types"


let machine: StateMachine<TMachineStates, TMachineEvents>
beforeAll(()=>{

  machine = new StateMachine(TMachineStates.SELECTING_PROJECT);

  machine.addState(TMachineStates.IDLING);
  machine.addState(TMachineStates.EXECUTING_PROCESS);
  machine.addState(TMachineStates.CONFIGURING_PROCESS);
  machine.addState(TMachineStates.COMPLETED);
  machine.addState(TMachineStates.DISPLAYING);



  machine.addTransition(TMachineStates.SELECTING_PROJECT,   TMachineStates.CONFIGURING_PROCESS,   TMachineEvents.ON_PROJECT_SELECTED);

  machine.addTransition(TMachineStates.CONFIGURING_PROCESS, TMachineStates.SELECTING_PROJECT,     TMachineEvents.ON_RESET);
  machine.addTransition(TMachineStates.CONFIGURING_PROCESS, TMachineStates.EXECUTING_PROCESS,     TMachineEvents.ON_START);

  machine.addTransition(TMachineStates.EXECUTING_PROCESS,   TMachineStates.SELECTING_PROJECT,     TMachineEvents.ON_RESET);
  machine.addTransition(TMachineStates.EXECUTING_PROCESS,   TMachineStates.IDLING,                TMachineEvents.ON_STOP);
  machine.addTransition(TMachineStates.EXECUTING_PROCESS,   TMachineStates.DISPLAYING,            TMachineEvents.ON_VIEW);

  machine.addTransition(TMachineStates.DISPLAYING,          TMachineStates.EXECUTING_PROCESS,     TMachineEvents.ON_MONITOR);

  machine.addTransition(TMachineStates.IDLING,              TMachineStates.COMPLETED,             TMachineEvents.ON_ARCHIVED);

  machine.addTransition(TMachineStates.COMPLETED,           TMachineStates.SELECTING_PROJECT,     TMachineEvents.ON_RESET);


  machine.registerOnEnterAction(TMachineStates.SELECTING_PROJECT, ()=>{console.log("onEnter: SELECTING_PROJECT")})
  machine.registerOnExitAction (TMachineStates.SELECTING_PROJECT, ()=>{console.log("onExit: SELECTING_PROJECT")})
  machine.registerOnTransitionAction (TMachineStates.SELECTING_PROJECT, TMachineEvents.ON_PROJECT_SELECTED, ()=>{console.log("onTransition: from SELECTING_PROJECT on ON_PROJECT_SELECTED event ")})

  machine.registerOnEnterAction(TMachineStates.CONFIGURING_PROCESS, ()=>{console.log("onEnter: CONFIGURING_PROCESS")})
  machine.registerOnExitAction (TMachineStates.CONFIGURING_PROCESS, ()=>{console.log("onExit: CONFIGURING_PROCESS")})
  machine.registerOnTransitionAction (TMachineStates.CONFIGURING_PROCESS, TMachineEvents.ON_PROJECT_SELECTED, ()=>{console.log("onTransition: from CONFIGURING_PROCESS on ON_RESET event ")})
  machine.registerOnTransitionAction (TMachineStates.CONFIGURING_PROCESS, TMachineEvents.ON_PROJECT_SELECTED, ()=>{console.log("onTransition: from CONFIGURING_PROCESS on ON_RESET event ")})




  console.log(machine);
})



describe("Machine State functionality", ()=>{
  test("Dummy", ()=>{
    expect(0).toBe(0);
  })
})