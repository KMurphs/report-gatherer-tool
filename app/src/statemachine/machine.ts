import { TMachineDefinition, TMachineStates } from "./types";

// https://stackoverflow.com/questions/39372804/how-to-loop-through-enum-values-for-display-in-radio-buttons
export class StateMachine<T, R>{

  private currentState: T;
  private definition: TMachineDefinition;
  private handleSeparator: string = "::";
  

  constructor(initialState: T){
    this.currentState = initialState;
    this.definition = {};

    const st = this.enumToString(this.currentState);
    this.definition[st] = {
      transitions: {},
      onEnterActions: [],
      onExitActions: [],
    }
  }




  addState(state: T){
    const st = this.enumToString(state);
    if(this.definition[st]) throw new TypeError(`machine state descriptions must to be unique: '${st}'`);
    this.definition[st] = {
      transitions: {},
      onEnterActions: [],
      onExitActions: [],
    }
  }
  getCurrentState(): T{ return this.currentState; }




  addTransition(fromState: T, toState: T, onEvent: R){

    const evt = this.enumToString(onEvent)
    const from = this.enumToString(fromState)
    const to = this.enumToString(toState)

    if(!this.definition[from]) throw new RangeError(`from-state '${from}' for transition is not recognized`);
    if(!this.definition[to]) throw new RangeError(`to-state '${to}' for transition is not recognized`);
    if(this.definition[from].transitions[evt]) throw new RangeError(`event '${evt}' is already registered for transition`);

    this.definition[from].transitions[evt] = {
      destination: (toState as unknown as string),
      actions: []
    };
  }





  handleEvent(onEvent: R){

    const evt = this.enumToString(onEvent);
    const state = this.enumToString(this.currentState);

    if(!this.definition[state]) throw RangeError(`current state '${state}' is not recognized`);
    if(!this.definition[state].transitions[evt]) throw RangeError(`Event '${evt}' is not supported from current state '${state}'`);


    this.definition[state].onExitActions.forEach(action => action())
    this.definition[state].transitions[evt].actions.forEach(action => action())
    this.definition[state].onEnterActions.forEach(action => action())


    this.currentState = this.definition[state].transitions[evt].destination as unknown as T

  }






  registerOnTransitionAction(fromState: T, onEvent: R, action: (...args: any[]) => void): string{

    const evt = this.enumToString(onEvent)
    const from = this.enumToString(fromState)

    if(!this.definition[from]) throw new RangeError(`from-state '${from}' for transition is not recognized`);
    if(!this.definition[from].transitions[evt]) throw new RangeError(`Event '${evt}' for transition from state '${from}' is not recognized`);

    this.definition[from].transitions[evt].actions.push(action)
    return btoa(`${from}${this.handleSeparator}${evt}${this.handleSeparator}${this.definition[from].transitions[evt].actions.length}`);
  }
  registerOnEnterAction(state: T, action: (...args: any[]) => void): string{
    let from = this.enumToString(state)
    if(!this.definition[from]) throw new RangeError(`from-state '${from}' is not recognized`);

    this.definition[from].onEnterActions.push(action);
    return btoa(`${state}${this.handleSeparator}${this.definition[from].onEnterActions.length}`);
  }
  registerOnExitAction(state: T, action: (...args: any[]) => void): string{
    let from = this.enumToString(state)
    if(!this.definition[from]) throw new RangeError(`from-state '${from}' is not recognized`);

    this.definition[from].onExitActions.push(action);
    return btoa(`${state}${this.handleSeparator}${this.definition[from].onExitActions.length}`);
  }
  unregisterOnTransitionAction(actionHandle: string){
    const [fromState, onEvent, index] = atob(actionHandle).split(this.handleSeparator);
    this.definition[fromState].transitions[onEvent].actions[Number(index)] = ()=>{}
  }
  unregisterOnEnterAction(actionHandle: string){
    const [state, index] = atob(actionHandle).split(this.handleSeparator);
    this.definition[state].onEnterActions[Number(index)] = ()=>{}
  }
  unregisterOnExitAction(actionHandle: string){
    const [state, index] = atob(actionHandle).split(this.handleSeparator);
    this.definition[state].onExitActions[Number(index)] = ()=>{}
  }








  private enumToString<T>(state: T): string{
    return (state as unknown as string).toLowerCase().replace(/ /g, "-");
  }


} 
