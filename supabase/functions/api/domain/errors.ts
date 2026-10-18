export type ValidationDetails = Record<string, string>;

export class DomainError extends Error {
  public readonly code: string;
  public readonly details?: ValidationDetails;

  constructor(code: string, message: string, details?: ValidationDetails) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.details = details;
  }
}

export interface ValidationSuccess {
  valid: true;
}

export interface ValidationFailure {
  valid: false;
  details: ValidationDetails;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;
