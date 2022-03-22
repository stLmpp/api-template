import { IsDefined, IsString } from 'class-validator';

import { ValidationService } from './validation.service';

class User {
  @IsDefined()
  @IsString()
  id!: string;
}

describe('ValidationService', () => {
  let validationService: ValidationService;

  beforeEach(() => {
    validationService = new ValidationService();
  });

  it('should create instance', () => {
    expect(validationService).toBeDefined();
  });

  it('should transform object to instance', async () => {
    const [instance] = await validationService.validate(User, { id: '1' });
    expect(instance).toBeInstanceOf(User);
  });

  it('should transform instance to instance', async () => {
    const user = new User();
    user.id = '1';
    const [instance] = await validationService.validate(User, user);
    expect(instance).toBeInstanceOf(User);
  });

  it('should transform array of objects to array of instances', async () => {
    const user = new User();
    user.id = '3';
    const [instances] = await validationService.validate(User, [{ id: '1' }, { id: '2' }, user]);
    expect(instances[0]).toBeInstanceOf(User);
    expect(instances[1]).toBeInstanceOf(User);
    expect(instances[2]).toBeInstanceOf(User);
  });

  it('should validate constraints on object', async () => {
    const [, errors] = await validationService.validate(User, { id: 1 });
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('id');
  });

  it('should validate constraints on array', async () => {
    const [, errors] = await validationService.validate(User, [{ id: 1 }, {}]);
    expect(errors).toHaveLength(3);
  });
});
