// swagger/swagger.config.js
const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NoSmoking API Documentation",
      version: "1.0.0",
      description: "Tài liệu API cho nền tảng hỗ trợ cai nghiện thuốc lá",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Membership: {
          type: "object",
          required: ["name", "duration_days", "price"],
          properties: {
            name: {
              type: "string",
              enum: ["default", "pro"],
            },
            description: { type: "string" },
            duration_days: { type: "integer" },
            price: { type: "number" },
            can_message_coach: { type: "boolean" },
            can_assign_coach: { type: "boolean" },
            can_use_quitplan: { type: "boolean" },
            can_use_reminder: { type: "boolean" },
            can_earn_special_badges: { type: "boolean" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    servers: [
      {
        url: 'http://localhost:3000/',  
        // url: 'https://smoking-cessation-backend.onrender.com/', 
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);
module.exports = swaggerSpec;
