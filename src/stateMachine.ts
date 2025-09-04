import { PlayerState } from './types';

export type StateTransition<S extends string> = {
  from: S;
  to: S;
  condition?: () => boolean;
  action?: () => void;
};

/**
 * Manages state transitions for the player.
 * This class provides a generic state machine implementation that allows
 * defining states, transitions between them, and actions to be performed
 * during transitions.
 */
export class StateMachine<S extends string = PlayerState> {
  private currentState: S;
  private transitions: StateTransition<S>[] = [];

  /**
   * Creates an instance of StateMachine.
   * @param initialState - The initial state of the state machine.
   */
  constructor(initialState: S) {
    this.currentState = initialState;
  }

  /**
   * Gets the current state of the state machine.
   * @returns The current state.
   */
  public getState(): S {
    return this.currentState;
  }

  /**
   * Adds a new state transition to the state machine.
   * @param transition - The state transition to be added.
   */
  public addTransition(transition: StateTransition<S>): void {
    this.transitions.push(transition);
  }

  /**
   * Transitions to a new state if the transition is valid.
   * @param targetState - The state to transition to.
   * @returns True if the transition was successful, false otherwise.
   */
  public transitionTo(targetState: S): boolean {
    const valid = this.transitions.find(
      (t) =>
        t.from === this.currentState && t.to === targetState && (!t.condition || t.condition()),
    );

    if (valid) {
      valid.action?.();
      this.currentState = targetState;
      return true;
    }

    return false;
  }

  /**
   * Resets the state machine to its initial state.
   * @param initialState - Optional initial state to reset to.
   */
  public reset(initialState?: S): void {
    this.currentState = initialState || this.transitions[0]?.from || (this.currentState as S);
  }
}
