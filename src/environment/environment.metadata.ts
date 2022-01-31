export class EnvPropertyMetadata {
  constructor(
    public readonly propertyKey: string,
    public readonly name: string,
    public readonly required: boolean,
    public readonly converter?: (value: any) => any
  ) {}
}

export class EnvironmentMetadata {
  private _store = new Map<string, EnvPropertyMetadata>();

  add(key: string, value: EnvPropertyMetadata): this {
    this._store.set(key, value);
    return this;
  }

  entries(): [string, EnvPropertyMetadata][] {
    return [...this._store.entries()];
  }
}

export const environmentMetadata = new EnvironmentMetadata();
