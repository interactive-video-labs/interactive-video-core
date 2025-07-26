import { PlayerState } from './types'

export type StateTransition<S extends string> = {
  from: S
  to: S
  condition?: () => boolean
  action?: () => void
}

/**
 * Manages state transitions for the player.
 * This class provides a generic state machine implementation that allows
 * defining states, transitions between them, and actions to be performed
 * during transitions.
 */
export class StateMachine<S extends string = PlayerState> {
  private currentState: S
  private transitions: StateTransition<S>[] = []

  constructor(initialState: S) {
    this.currentState = initialState
  }

  public getState(): S {
    return this.currentState
  }

  public addTransition(transition: StateTransition<S>): void {
    this.transitions.push(transition)
  }

  public transitionTo(targetState: S): boolean {
    const valid = this.transitions.find(
      (t) =>
        t.from === this.currentState &&
        t.to === targetState &&
        (!t.condition || t.condition())
    )

    if (valid) {
      valid.action?.()
      this.currentState = targetState
      return true
    }

    return false
  }

  public reset(initialState?: S): void {
    this.currentState = initialState || this.transitions[0]?.from || (this.currentState as S)
  }
}
