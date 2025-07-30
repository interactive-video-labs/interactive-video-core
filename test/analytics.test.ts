import { Analytics } from '../src/analytics';
import { describe, it, expect, vi } from 'vitest';

describe('Analytics', () => {
  it('should track events and call registered hooks', () => {
    const analytics = new Analytics();
    const mockHook = vi.fn();

    analytics.on('TEST_EVENT', mockHook);
    analytics.track('TEST_EVENT', { data: 'test' });

    expect(mockHook).toHaveBeenCalledTimes(1);
    expect(mockHook).toHaveBeenCalledWith('TEST_EVENT', { data: 'test' });
  });

  it('should reset hooks', () => {
    const analytics = new Analytics();
    const mockHook = vi.fn();

    analytics.on('VIDEO_PAUSED', mockHook);
    analytics.reset();
    analytics.track('VIDEO_PAUSED');

    expect(mockHook).not.toHaveBeenCalled();
  });
});