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
    try {
      const history = await this.getDecisionHistory();
      history.push(decision);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save decision to localStorage:', error);
      throw new Error('Decision storage failed');
    }
  }

  /**
   * Retrieves the decision history from local storage.
   * @returns A promise that resolves to an array of decisions.
   */
  async getDecisionHistory(): Promise<Decision[]> {
    try {
      const history = localStorage.getItem(this.STORAGE_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to get decision history from localStorage:', error);
      throw new Error('Decision retrieval failed');
    }
  }

  /**
   * Clears the decision history in local storage.
   */
  async clearDecisionHistory(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear decision history from localStorage:', error);
      throw new Error('Failed to clear decision history');
    }
  }
}
