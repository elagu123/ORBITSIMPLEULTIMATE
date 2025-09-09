// Basic test to verify Jest setup
describe('Jest Setup', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async operations', async () => {
    const asyncFunction = async () => {
      return new Promise(resolve => setTimeout(() => resolve('done'), 100));
    };

    const result = await asyncFunction();
    expect(result).toBe('done');
  });

  it('should work with mocks', () => {
    const mockFn = jest.fn();
    mockFn('test');
    
    expect(mockFn).toHaveBeenCalledWith('test');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should work with dates', () => {
    const now = new Date();
    expect(now).toBeInstanceOf(Date);
  });

  it('should work with objects', () => {
    const obj = { name: 'test', value: 42 };
    expect(obj).toEqual({ name: 'test', value: 42 });
    expect(obj).toHaveProperty('name', 'test');
  });
});