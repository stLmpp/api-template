import { ValidationError as ClassValidatorValidationError } from 'class-validator';

import { ValidationError } from './validation-error';

function formatValidationError(message: ClassValidatorValidationError, parent?: string): ValidationError[] {
  const property = parent ? `${parent}.${message.property}` : message.property;
  const messages: ValidationError[] = [];
  if (message.constraints) {
    const values = Object.entries(message.constraints).map(
      ([constraint, error]) => new ValidationError(property, error.replace(message.property, property), constraint)
    );
    messages.push(...values);
  }
  if (message.children?.length) {
    messages.push(...formatValidationsErrors(message.children, property));
  }
  return messages;
}

export function formatValidationsErrors(messages: ClassValidatorValidationError[], parent?: string): ValidationError[] {
  return messages.reduce(
    (acc, message) => [...acc, ...formatValidationError(message, parent)],
    [] as ValidationError[]
  );
}
