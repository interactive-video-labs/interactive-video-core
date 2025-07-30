import { Decision, DecisionAdapter } from './types';

export class LocalStorageDecisionAdapter implements DecisionAdapter {
  private readonly STORAGE_KEY = 'ivl_decision_history';

  async saveDecision(decision: Decision): Promise<void> {
    const history = await this.getDecisionHistory();
    history.push(decision);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
  }

  async getDecisionHistory(): Promise<Decision[]> {
    const history = localStorage.getItem(this.STORAGE_KEY);
    return history ? JSON.parse(history) : [];
  }

  async clearDecisionHistory(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
