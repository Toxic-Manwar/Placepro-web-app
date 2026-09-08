import { Request, Response, NextFunction } from 'express';

export class ValidationError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, code = 'INVALID_INPUT', statusCode = 400) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Validates that all required fields exist and are not empty in req.body
 */
export function validateRequired(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing: string[] = [];
    for (const field of fields) {
      const val = req.body[field];
      if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
        missing.push(field);
      }
    }
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing or empty required fields: ${missing.join(', ')}`,
        code: 'MISSING_REQUIRED_FIELDS',
        missing
      });
    }
    next();
  };
}

/**
 * Validates a numeric value within a specific range [min, max]
 */
export function validateNumericRange(val: any, min: number, max: number, fieldName: string): number {
  const num = Number(val);
  if (isNaN(num) || num < min || num > max) {
    throw new ValidationError(
      `${fieldName} must be a number between ${min} and ${max}`,
      'OUT_OF_RANGE_VALUE'
    );
  }
  return num;
}

/**
 * Validates an enum value
 */
export function validateEnum<T extends string>(val: any, allowedValues: T[], fieldName: string): T {
  if (!val || !allowedValues.includes(val as T)) {
    throw new ValidationError(
      `Invalid ${fieldName}: '${val}'. Must be one of: ${allowedValues.join(', ')}`,
      'INVALID_ENUM_VALUE'
    );
  }
  return val as T;
}

/**
 * Validates string is non-empty
 */
export function validateNonEmptyString(val: any, fieldName: string): string {
  if (typeof val !== 'string' || val.trim().length === 0) {
    throw new ValidationError(
      `${fieldName} must be a non-empty string`,
      'INVALID_STRING_VALUE'
    );
  }
  return val.trim();
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
