import { TAction, TActionHandle, TTransition, TInitializer } from "./types"



















export class TIntTransition<T extends string> {
  private to: T;
  private from: string;
  private on: string;
  private actions: TAction[]
  /**
   *
   */
  constructor(fromState: string, toState: T, onEvent: string) {
    
    // Ensure that input params are valid
    if(!fromState || fromState === "") throw new TypeError(`Provide Valid fromState '${fromState}' to create transition`);
    if(!toState || toState === "") throw new TypeError(`Provide Valid toState '${toState}' to create transition`);
    if(!onEvent || onEvent === "") throw new TypeError(`Provide Valid event '${onEvent}' to create transition`);

    this.from = fromState;
    this.to = toState;
    this.on = onEvent;
    
    this.actions = [];
  }


  /** Add a function that will be called when a transition from
   *  on state to another is made.
   *
   *  The handle is provided to be able to unregister the action 
   *  later
   * 
   *  The Action is the function to be called
   */
  registerAction(action: TAction, handle?: TActionHandle){

    if(typeof action !== 'function') throw new TypeError("Attempting to Register an Action that is not callable");
    
    // Add action to the action registry
    this.actions.push(action);

    // If handle is provided. Set it to the newly registered action
    if(handle) handle.reference = { 
      isOnEnterAction: false, 
      isOnExitAction: false, 
      fromState: this.from, 
      event: this.on, 
      index: this.actions.length - 1
    }

    // Transition Class Instance
    return this;
  }


  /** Remove a function that was previously registered
   */
  unregisterAction(handle: TActionHandle): TIntTransition<T>{
    if(!handle) throw new TypeError("Provide a valid handle to unregister 'onTransition' Action");
    
    this.actions[handle.reference.index] = ()=>{}
    return this;
  }

  /** Get the target state of the transition
   */
  nextState(){ return this.to }


  executeActions(){
    this.actions.forEach(action => action())
  }
}





















// Type used internally in the TState Class. Tightly coupled with the class
export type TActionNameSpace<T extends string, R extends string> = {
  registerAction: (action: TAction, handle?: TActionHandle)=>TState<T, R>,
  executeActions: () => void
}


export class TState<T extends string, R extends string> {

  private transitions: {[key: string]: TIntTransition<T>};
  private state: string;
  private onEnterActions: TAction[];
  private onExitActions: TAction[];
  onEnter: TActionNameSpace<T, R>;
  onExit: TActionNameSpace<T, R>;
  

  constructor(state: string, transitions: TTransition<T, R>[]){
    
    this.transitions = {}
    this.onEnterActions = []
    this.onExitActions = []

    // Ensure that input params are valid
    if(!state || state === "") throw new TypeError(`Provide Valid state '${state}' to create TState Instance`);

    this.state = state;


    // Handle transitions collection
    transitions.forEach(transition => {
      
      const from = enumToString(transition.from)
      const event = enumToString(transition.on)

      // Ensure that input params are valid
      if(!from || from === "") throw new TypeError(`Provide Valid state '${from}' to create Transition`);
      if(!event || event === "") throw new TypeError(`Provide Valid event '${event}' to create Transition`);
      if(!transition.to || transition.to === "") throw new TypeError(`Provide Valid target state '${transition.to}' to create Transition`);

      this.transitions[event] = new TIntTransition(from, transition.to, event)
    
    })




    // Namespace
    this.onEnter = {
      registerAction: (action: TAction, handle?: TActionHandle): TState<T, R> => {

        if(typeof action !== 'function') throw new TypeError("Attempting to Register an Action that is not callable");
        
        // Add action to the action registry
        this.onEnterActions.push(action);

        // If handle is provided. Set it to the newly registered action
        if(handle) handle.reference = { 
          isOnEnterAction: true, 
          isOnExitAction: false, 
          fromState: this.state, 
          event: null, 
          index: this.onEnterActions.length - 1
        }
        
        // TState Class Instance
        return this;
      },
      executeActions: () => {
        this.onEnterActions.forEach(action => action())
      }
    }


    // Namespace
    this.onExit = {
      registerAction: (action: TAction, handle?: TActionHandle): TState<T, R> => {

        if(typeof action !== 'function') throw new TypeError("Attempting to Register an Action that is not callable");

        // Add action to the action registry
        this.onExitActions.push(action);

        // If handle is provided. Set it to the newly registered action
        if(handle) handle.reference = { 
          isOnEnterAction: false, 
          isOnExitAction: true, 
          fromState: this.state, 
          event: null, 
          index: this.onExitActions.length - 1
        }
    
        // TState Class Instance
        return this;
      },
      executeActions: () => {
        this.onEnterActions.forEach(action => action())
      }
    }
    
  }


  // Namespace - sort of
  onTransition(event: R){
    let evt = enumToString(event)
      
    // Ensure that input params are valid
    if(!evt || evt === "") throw new TypeError(`Failed to Access Transition On '${evt}' from state '${this.state}'. Event is invalid`);
    if(!this.transitions[evt]) throw new TypeError(`Failed to Access Transition On '${evt}' from state '${this.state}'. Event is not supported`);
    
    // TintTransition Class Instance
    return this.transitions[evt];
  }

  // Will unregister action in the TState or the subclass TIntTransition
  unregisterAction(handle: TActionHandle): TState<T, R>{

    if(!handle) throw new TypeError("Provide a valid handle to unregister Action")

    // Deregister onEnter Action
    if(handle.reference.isOnEnterAction){
      this.onEnterActions[handle.reference.index] = ()=>{}
    }
    // Deregister onExit Action
    else if(handle.reference.isOnExitAction){
      this.onExitActions[handle.reference.index] = ()=>{}
    }
    // Deregister onTransition Action
    else if(handle.reference.event !== null){
      this.transitions[handle.reference.event].unregisterAction(handle)
    }

    // TState Class Instance
    return this;
  }
}




















export class StateMachine<Td extends string, T extends string, R extends string>{

  private definitions: {[key: string]: TState<T, R>};
  private currentState: T;

  constructor(tState: { [key in Td]: string }, initObj: TInitializer<T, R>){
    
    this.currentState = initObj.initialState

    // The next lines uses some magic to load all the states directly from the
    // provided state enum. These states are then used to create TState Objects
    // https://github.com/microsoft/TypeScript/issues/30611
    // https://github.com/microsoft/TypeScript/issues/30611
    this.definitions = {}
    Object.values(tState)
          .map(state => enumToString(state))
          .forEach((state: string) => {
      
      // Collect transitions from the current state
      let stateTransitions = initObj.transitions.filter(tr => enumToString(tr.from) === state)
      // Instantiate TState Object for current state
      this.definitions[state] = new TState(state, [...stateTransitions]);
    })

  }


  handleEvent(onEvent: R){

    
    // Ensure Current State is valid
    if(this.currentState == null) throw TypeError(`machine must be initialized with a valid state.`);
    const state = enumToString(this.currentState);
    if(!this.definitions[state]) throw TypeError(`current state '${state}' is not recognized`);


    // Ensure event can be processed from this state
    const evt = enumToString(onEvent);
    const transition = this.definitions[state].onTransition(onEvent)
    if(!transition) throw TypeError(`Event '${evt}' is not supported from current state '${state}'`);
    

    // Ensure we can get to next state
    const nextState = transition.nextState() as unknown as T;
    const to = enumToString(nextState);
    if(!to || to === "") throw new TypeError(`Failed to Access Next State '${to}'. State is invalid`);
    if(!this.definitions[to]) throw new TypeError(`Failed to Access Next State '${to}' for transition. State is not recognized`);


    // Execute Actions
    this.definitions[state].onExit.executeActions();
    transition.executeActions();
    this.definitions[to].onEnter.executeActions();


    this.currentState = nextState

  }


  // Will unregister action in the TState or the subclass TIntTransition
  unregisterAction(handle: TActionHandle): StateMachine<Td, T, R>{

    if(!handle) throw new TypeError("Provide a valid handle to unregister Action");

    // Defer actually implementation to the TState unregisterAction method
    this.definitions[handle.reference.fromState].unregisterAction(handle);
    
    // StateMachine Class Instance
    return this;
  }


  // Sort of namespace for external use
  state(state: T){

    let from = enumToString(state)
    
    // Ensure that input params are valid
    if(!from || from === "") throw new TypeError(`Failed to Access State '${from}'. State is invalid`);
    if(!this.definitions[from]) throw new TypeError(`Failed to Access State '${from}'. State is not recognized`);
    
    // TState Class Instance
    return this.definitions[from]
  }

}


// While converting enum to string, the string values are sent back
// One needs to make sure that we key use those as keys
function enumToString<T>(state: T): string{
  return (state as unknown as string).toLowerCase()
                                     .replace(/ /g, "-");
}