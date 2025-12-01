import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Etags API',
      version: '1.0.0',
      description:
        'API documentation for Etags - Product tagging and blockchain stamping',
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'brand'] },
            status: { type: 'integer', enum: [0, 1] },
            avatar_url: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Brand: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            logo_url: { type: 'string', nullable: true },
            status: { type: 'integer', enum: [0, 1] },
            descriptions: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            metadata: { type: 'object' },
            status: { type: 'integer', enum: [0, 1] },
            brand_id: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Tag: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            product_ids: { type: 'array', items: { type: 'integer' } },
            metadata: { type: 'object' },
            is_stamped: { type: 'integer', enum: [0, 1] },
            hash_tx: { type: 'string', nullable: true },
            publish_status: { type: 'integer', enum: [0, 1] },
            chain_status: {
              type: 'integer',
              nullable: true,
              enum: [0, 1, 2, 3, 4, 5],
              description:
                '0=CREATED, 1=DISTRIBUTED, 2=CLAIMED, 3=TRANSFERRED, 4=FLAGGED, 5=REVOKED',
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/app/api/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
