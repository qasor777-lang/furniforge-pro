export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "FurniForge Pro API",
    version: "1.0.0",
    description: "AI Furniture Design Platform API",
  },
  servers: [{ url: "/api" }],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "System health status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    ts: { type: "string", format: "date-time" },
                    db: { type: "object" },
                    uptime: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/models": {
      get: {
        summary: "List furniture models",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "room", in: "query", schema: { type: "string" } },
          { name: "style", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "List of models",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    models: { type: "array", items: { $ref: "#/components/schemas/FurnitureModel" } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a furniture model",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateModelInput" },
            },
          },
        },
        responses: {
          "200": { description: "Created model" },
          "400": { description: "Validation error" },
          "409": { description: "SKU already exists" },
        },
      },
    },
    "/projects": {
      get: {
        summary: "List projects",
        responses: {
          "200": {
            description: "Projects list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    projects: { type: "array" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create or update project",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProjectInput" },
            },
          },
        },
        responses: {
          "200": { description: "Saved project" },
          "400": { description: "Validation error" },
        },
      },
    },
    "/sets": {
      get: {
        summary: "List room sets",
        responses: {
          "200": { description: "Room sets list" },
        },
      },
    },
  },
  components: {
    schemas: {
      FurnitureModel: {
        type: "object",
        properties: {
          id: { type: "integer" },
          sku: { type: "string" },
          nameUz: { type: "string" },
          categoryCode: { type: "string" },
          bboxW: { type: "integer" },
          bboxD: { type: "integer" },
          bboxH: { type: "integer" },
          baseCostUzs: { type: "integer" },
          paramSchema: { type: "object" },
          defaultParams: { type: "object" },
          geometryDsl: { type: "object" },
        },
      },
      CreateModelInput: {
        type: "object",
        required: ["sku", "nameUz", "categoryCode", "paramSchema", "defaultParams", "geometryDsl", "bboxW", "bboxD", "bboxH"],
        properties: {
          sku: { type: "string", minLength: 1, maxLength: 60 },
          nameUz: { type: "string", minLength: 1, maxLength: 200 },
          categoryCode: { type: "string" },
          paramSchema: { type: "object" },
          defaultParams: { type: "object" },
          geometryDsl: { type: "object" },
          bboxW: { type: "integer", minimum: 1 },
          bboxD: { type: "integer", minimum: 1 },
          bboxH: { type: "integer", minimum: 1 },
          baseCostUzs: { type: "integer", minimum: 0 },
          styleTags: { type: "array", items: { type: "string" } },
          roomCompat: { type: "object" },
          source: { type: "string" },
        },
      },
      CreateProjectInput: {
        type: "object",
        required: ["name", "layoutJson"],
        properties: {
          id: { type: "integer" },
          name: { type: "string", minLength: 1, maxLength: 200 },
          roomAnalysisId: { type: "integer", nullable: true },
          layoutJson: { type: "string" },
          roomSize: {
            type: "object",
            properties: {
              roomW: { type: "integer", minimum: 1 },
              roomD: { type: "integer", minimum: 1 },
              roomH: { type: "integer", minimum: 1 },
            },
          },
        },
      },
    },
  },
};
