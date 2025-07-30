import { Decision, DecisionAdapter } from './types';

/**
 * The InMemoryDecisionAdapter class implements the DecisionAdapter interface
 * and stores decisions in memory.
 */
export class InMemoryDecisionAdapter implements DecisionAdapter {
  private decisions: Decision[] = [];

  /**
   * Saves a decision to the in-memory store.
   * @param decision - The decision to save.
   */
  async saveDecision(decision: Decision): Promise<void> {
    this.decisions.push(decision);
  }

  /**
   * Retrieves the decision history from the in-memory store.
   * @returns A promise that resolves to an array of decisions.
   */
  async getDecisionHistory(): Promise<Decision[]> {
    return [...this.decisions];
  }

  /**
   * Clears the decision history in the in-memory store.
   */
  async clearDecisionHistory(): Promise<void> {
    this.decisions = [];
  }
}
