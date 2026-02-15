export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 422, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class FileTooLargeError extends AppError {
  constructor(size, limit) {
    super(`File exceeds limit: ${size} bytes (max ${limit} bytes)`, 413, 'FILE_TOO_LARGE');
  }
}

export class ConversionError extends AppError {
  constructor(message) {
    super(message, 500, 'CONVERSION_ERROR');
  }
}

export class StorageError extends AppError {
  constructor(message) {
    super(message, 500, 'STORAGE_ERROR');
  }
}
