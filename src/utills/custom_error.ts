// Custom Error Handler
export class CustomError extends Error {
  public code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "CustomError";
    this.code = code;
  }
}

export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
  }
}

export class InvalidCredentialsError extends CustomError {
  constructor(message: string) {
    super(message, "INVALID_CREDENTIALS");
  }
}

export class UserExistsError extends CustomError {
  constructor(message: string) {
    super(message, "USER_EXISTS");
  }
}
export class ProductError extends CustomError {
  constructor(message: string) {
    super(message, "PRODUCT");
  }
}
export class CartError extends CustomError {
  constructor(message: string) {
    super(message, "CART");
  }
}
export class VerificationEmailError extends CustomError {
  constructor(message: string) {
    super(message, "EMAIL_VERIFICATION_FAILED");
  }
}
export class StripeKeyError extends CustomError {
  constructor(message: string) {
    super(message, "STRIPE_KEY_NOT_FOUND");
  }
}