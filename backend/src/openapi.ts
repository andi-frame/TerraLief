// OpenAPI 3.0 specification for TerraLief backend API
export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'TerraLief API',
    version: '1.0.0',
    description: 'Authentication API for the TerraLief application.',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local development' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token obtained from /auth/login',
      },
    },
    schemas: {
      // ── Request bodies ──────────────────────────────────────────────────────
      RegisterRequest: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: {
            type: 'string', minLength: 3, maxLength: 50,
            pattern: '^[a-zA-Z0-9_]+$',
            example: 'johndoe',
          },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: {
            type: 'string', minLength: 8,
            description: 'Must contain uppercase, lowercase, and a digit',
            example: 'Secret123',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'Secret123' },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'eyJhbGci...' },
        },
      },
      // ── Shared shapes ───────────────────────────────────────────────────────
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          username: { type: 'string', example: 'johndoe' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Tokens: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', description: 'Short-lived JWT (15 min)' },
          refreshToken: { type: 'string', description: 'Long-lived JWT (7 days)' },
        },
      },
      // ── Responses ───────────────────────────────────────────────────────────
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Error message' },
        },
      },
      ValidationErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Bad Request' },
          errors: { type: 'array', items: { type: 'object' } },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Server is healthy',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' }, timestamp: { type: 'string', format: 'date-time' } } } } },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
        },
        responses: {
          '201': {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    { properties: { data: { $ref: '#/components/schemas/UserProfile' } } },
                  ],
                },
              },
            },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } } } },
          '409': { description: 'Email or username already in use', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and obtain tokens',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          allOf: [
                            { $ref: '#/components/schemas/Tokens' },
                            { properties: { user: { $ref: '#/components/schemas/UserProfile' } } },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } } } },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenRequest' } } },
        },
        responses: {
          '200': {
            description: 'New tokens issued',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    { properties: { data: { $ref: '#/components/schemas/Tokens' } } },
                  ],
                },
              },
            },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } } } },
          '401': { description: 'Invalid or expired refresh token', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout (invalidates refresh token)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Logged out successfully',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'Logged out successfully' } } } } },
          },
          '401': { description: 'Missing or invalid access token', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User profile',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    { properties: { data: { $ref: '#/components/schemas/UserProfile' } } },
                  ],
                },
              },
            },
          },
          '401': { description: 'Missing or invalid access token', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '404': { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
  },
} as const
