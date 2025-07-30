import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InMemoryDecisionAdapter } from '../src/InMemoryDecisionAdapter';
import { LocalStorageDecisionAdapter } from '../src/localStorageDecisionAdapter';
import { Decision } from '../src/types';

describe('InMemoryDecisionAdapter', () => {
  let adapter: InMemoryDecisionAdapter;

  beforeEach(() => {
    adapter = new InMemoryDecisionAdapter();
  });

  it('should save and retrieve decisions', async () => {
    const decision1: Decision = {
      cue: { id: 'cue1', startTime: 0, endTime: 10 },
      type: 'linear',
      time: 5,
      reason: 'test',
    };
    const decision2: Decision = {
      cue: { id: 'cue2', startTime: 10, endTime: 20 },
      type: 'nonlinear',
      time: 15,
      reason: 'test',
    };

    await adapter.saveDecision(decision1);
    await adapter.saveDecision(decision2);

    const history = await adapter.getDecisionHistory();
    expect(history).toEqual([decision1, decision2]);
  });

  it('should clear decision history', async () => {
    const decision: Decision = {
      cue: { id: 'cue1', startTime: 0, endTime: 10 },
      type: 'linear',
      time: 5,
      reason: 'test',
    };

    await adapter.saveDecision(decision);
    let history = await adapter.getDecisionHistory();
    expect(history).toEqual([decision]);

    await adapter.clearDecisionHistory();
    history = await adapter.getDecisionHistory();
    expect(history).toEqual([]);
  });
});

describe('LocalStorageDecisionAdapter', () => {
  let adapter: LocalStorageDecisionAdapter;
  const MOCK_STORAGE_KEY = 'ivl_decision_history';
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    localStorageMock = {};
    vi.stubGlobal('localStorage', {
      setItem: vi.fn((key, value) => {
        localStorageMock[key] = value;
      }),
      getItem: vi.fn((key) => localStorageMock[key] || null),
      removeItem: vi.fn((key) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
    });
    adapter = new LocalStorageDecisionAdapter();
  });

  it('should save and retrieve decisions from local storage', async () => {
    const decision1: Decision = {
      cue: { id: 'cueA', startTime: 0, endTime: 10 },
      type: 'linear',
      time: 5,
      reason: 'test-ls',
    };
    const decision2: Decision = {
      cue: { id: 'cueB', startTime: 10, endTime: 20 },
      type: 'nonlinear',
      time: 15,
      reason: 'test-ls',
    };

    await adapter.saveDecision(decision1);
    expect(localStorage.setItem).toHaveBeenCalledWith(MOCK_STORAGE_KEY, JSON.stringify([decision1]));

    await adapter.saveDecision(decision2);
    expect(localStorage.setItem).toHaveBeenCalledWith(MOCK_STORAGE_KEY, JSON.stringify([decision1, decision2]));

    const history = await adapter.getDecisionHistory();
    expect(history).toEqual([decision1, decision2]);
    expect(localStorage.getItem).toHaveBeenCalledWith(MOCK_STORAGE_KEY);
  });

  it('should clear decision history in local storage', async () => {
    const decision: Decision = {
      cue: { id: 'cueC', startTime: 0, endTime: 10 },
      type: 'linear',
      time: 5,
      reason: 'test-ls-clear',
    };

    await adapter.saveDecision(decision);
    let history = await adapter.getDecisionHistory();
    expect(history).toEqual([decision]);

    await adapter.clearDecisionHistory();
    expect(localStorage.removeItem).toHaveBeenCalledWith(MOCK_STORAGE_KEY);
    history = await adapter.getDecisionHistory();
    expect(history).toEqual([]);
  });

  it('should return empty array if no history in local storage', async () => {
    vi.spyOn(localStorage, 'getItem').mockReturnValueOnce(null);
    const history = await adapter.getDecisionHistory();
    expect(history).toEqual([]);
  });
});
