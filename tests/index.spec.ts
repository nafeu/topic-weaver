import { describe, expect, test } from '@jest/globals';
import { helloWorld } from '../index';

describe('helloWorld', () => {
  test('returns a string', () => {
    const result = helloWorld();
    expect(typeof result).toBe('string');
  });

  test('returns a greeting message', () => {
    const result = helloWorld();
    expect(result).toMatch(/Hello World/);
  });

  test('includes package-specific message', () => {
    const result = helloWorld();
    expect(result).toContain('example modern npm package');
  });
});
