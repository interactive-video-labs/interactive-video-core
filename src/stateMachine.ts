import { PlayerState } from './types'

export type StateTransition<S extends string> = {
  from: S
  to: S
  condition?: () => boolean
  action?: () => void
}

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
