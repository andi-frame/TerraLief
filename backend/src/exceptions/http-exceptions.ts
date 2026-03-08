export class HttpException extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors?: unknown
  ) {
    super(message)
    this.name = 'HttpException'
  }
}

export class BadRequestException extends HttpException {
  constructor(message = 'Bad Request', errors?: unknown) {
    super(400, message, errors)
    this.name = 'BadRequestException'
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized') {
    super(401, message)
    this.name = 'UnauthorizedException'
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden') {
    super(403, message)
    this.name = 'ForbiddenException'
  }
}

export class NotFoundException extends HttpException {
  constructor(message = 'Not Found') {
    super(404, message)
    this.name = 'NotFoundException'
  }
}

export class ConflictException extends HttpException {
  constructor(message = 'Conflict') {
    super(409, message)
    this.name = 'ConflictException'
  }
}

export class InternalServerException extends HttpException {
  constructor(message = 'Internal Server Error') {
    super(500, message)
    this.name = 'InternalServerException'
  }
}
