export class ValidationError {
  constructor(public readonly property: string, public readonly message: string, public readonly constraint: string) {}
}
