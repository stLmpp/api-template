import { Result } from './result';

describe('Result', () => {
  it('should setData', () => {
    const result = new Result<string>();
    result.setData('test');
    expect(result.toJSON().data).toBe('test');
  });

  it('should setMeta', () => {
    const result = new Result<string>();
    result.setMeta({ id: 1 });
    expect(result.toJSON().meta?.id).toBe(1);
  });

  it('should set params via constructor', () => {
    const result = new Result('test', { metaId: 1 });
    expect(result.toJSON()).toEqual({ data: 'test', meta: { metaId: 1 } });
  });
});
