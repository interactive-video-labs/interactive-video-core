import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StateMachine, StateTransition } from '../src/stateMachine';
import { PlayerState } from '../src/types';

describe('StateMachine', () => {
  let stateMachine: StateMachine<PlayerState>;

  beforeEach(() => {
    stateMachine = new StateMachine<PlayerState>('idle');
  });

  it('should initialize with the correct initial state', () => {
    expect(stateMachine.getState()).toBe('idle');
  });

  it('should return the current state', () => {
    stateMachine.addTransition({ from: 'idle', to: 'playing' });
    stateMachine.transitionTo('playing');
    expect(stateMachine.getState()).toBe('playing');
  });

  it('should add a transition', () => {
    const transition: StateTransition<PlayerState> = { from: 'idle', to: 'playing' };
    stateMachine.addTransition(transition);
  });

  it('should transition to a new state if valid', () => {
    stateMachine.addTransition({ from: 'idle', to: 'playing' });
    const result = stateMachine.transitionTo('playing');
    expect(result).toBe(true);
    expect(stateMachine.getState()).toBe('playing');
  });

  it('should not transition to a new state if invalid', () => {
    stateMachine.addTransition({ from: 'idle', to: 'playing' });
    const result = stateMachine.transitionTo('ended'); // No transition from idle to ended
    expect(result).toBe(false);
    expect(stateMachine.getState()).toBe('idle');
  });

  it('should execute action on successful transition', () => {
    const mockAction = vi.fn();
    stateMachine.addTransition({ from: 'idle', to: 'playing', action: mockAction });
    stateMachine.transitionTo('playing');
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('should only transition if condition is met', () => {
    const conditionTrue = () => true;
    const conditionFalse = () => false;

    stateMachine.addTransition({ from: 'idle', to: 'playing', condition: conditionTrue });
    stateMachine.addTransition({ from: 'playing', to: 'ended', condition: conditionFalse });

    // Should transition
    let result = stateMachine.transitionTo('playing');
    expect(result).toBe(true);
    expect(stateMachine.getState()).toBe('playing');

    // Should not transition
    result = stateMachine.transitionTo('ended');
    expect(result).toBe(false);
    expect(stateMachine.getState()).toBe('playing');
  });

  it('should reset to initial state if provided', () => {
    stateMachine.addTransition({ from: 'idle', to: 'playing' });
    stateMachine.transitionTo('playing');
    expect(stateMachine.getState()).toBe('playing');

    stateMachine.reset('idle');
    expect(stateMachine.getState()).toBe('idle');
  });

  it('should reset to the first transitions from state if no initial state provided', () => {
    stateMachine = new StateMachine<PlayerState>('playing'); // Start in a different state
    stateMachine.addTransition({ from: 'idle', to: 'playing' });
    stateMachine.addTransition({ from: 'playing', to: 'ended' });

    stateMachine.reset();
    expect(stateMachine.getState()).toBe('idle');
  });

  it('should reset to current state if no transitions and no initial state provided', () => {
    stateMachine = new StateMachine<PlayerState>('playing');
    stateMachine.reset();
    expect(stateMachine.getState()).toBe('playing');
  });
});