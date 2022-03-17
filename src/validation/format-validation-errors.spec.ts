import { ValidationError } from 'class-validator';
import { formatValidationsErrors } from './format-validation-errors';

describe('format-validation-errors', () => {
  it('should format validation errors', async () => {
    const validationErrors: ValidationError[] = [
      { property: 'property', constraints: { isString: 'is not string' } },
      { property: 'nested', children: [{ property: 'propertyNested', constraints: { isString: 'is not string' } }] },
    ];
    const validationErrorsFormatted = formatValidationsErrors(validationErrors);
    expect(validationErrorsFormatted).toHaveLength(2);
    expect(validationErrorsFormatted[0].property).toBe('property');
    expect(validationErrorsFormatted[1].property).toBe('nested.propertyNested');
  });
});
