import { Decision, DecisionAdapter } from './types';

/**
 * The LocalStorageDecisionAdapter class implements the DecisionAdapter interface
 * and uses local storage to store decisions.
 */
export class LocalStorageDecisionAdapter implements DecisionAdapter {
  private readonly STORAGE_KEY = 'ivl_decision_history';

  /**
   * Saves a decision to the local storage.
   * @param decision - The decision to save.
   */
  async saveDecision(decision: Decision): Promise<void> {
    const history = await this.getDecisionHistory();
    history.push(decision);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
  }

  /**
   * Retrieves the decision history from local storage.
   * @returns A promise that resolves to an array of decisions.
   */
  async getDecisionHistory(): Promise<Decision[]> {
    const history = localStorage.getItem(this.STORAGE_KEY);
    return history ? JSON.parse(history) : [];
  }

  /**
   * Clears the decision history in local storage.
   */
  async clearDecisionHistory(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
