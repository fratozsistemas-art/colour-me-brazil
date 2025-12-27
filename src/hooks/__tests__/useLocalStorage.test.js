import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useLocalStorage from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    expect(result.current[0]).toBe('initial');
  });

  it('stores value in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('new value');
    });
    
    expect(result.current[0]).toBe('new value');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new value'));
  });

  it('retrieves existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('existing value'));
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    expect(result.current[0]).toBe('existing value');
  });

  it('handles objects', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-obj', { foo: 'bar' })
    );
    
    act(() => {
      result.current[1]({ baz: 'qux' });
    });
    
    expect(result.current[0]).toEqual({ baz: 'qux' });
  });

  it('handles arrays', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-arr', [1, 2, 3])
    );
    
    act(() => {
      result.current[1]([4, 5, 6]);
    });
    
    expect(result.current[0]).toEqual([4, 5, 6]);
  });

  it('handles null values', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-null', 'initial')
    );
    
    act(() => {
      result.current[1](null);
    });
    
    expect(result.current[0]).toBe(null);
  });

  it('handles function updaters', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-func', 0)
    );
    
    act(() => {
      result.current[1](prev => prev + 1);
    });
    
    expect(result.current[0]).toBe(1);
    
    act(() => {
      result.current[1](prev => prev + 1);
    });
    
    expect(result.current[0]).toBe(2);
  });

  it('handles JSON parse errors gracefully', () => {
    localStorage.setItem('test-key', 'invalid json {]');
    
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'fallback')
    );
    
    // Should fall back to initial value on parse error
    expect(result.current[0]).toBe('fallback');
  });
});
