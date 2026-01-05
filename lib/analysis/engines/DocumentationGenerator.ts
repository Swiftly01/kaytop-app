// Documentation Generator for creating comprehensive endpoint documentation

import { 
  BackendEndpoint, 
  FrontendEndpoint, 
  EndpointInventory, 
  RoleDocumentation, 
  EndpointExample, 
  UserRole, 
  EndpointCategory,
  JsonSchema,
  OpenApiSpec,
  Permission
} from '../types';
import { DocumentationGenerator as IDocumentationGenerator } from '../interfaces/engines';

/**
 * Documentation Generator for creating endpoint inventories and comprehensive API documentation
 */
export class DocumentationGenerator implements IDocumentationGenerator {
  
  /**
   * Generate comprehensive endpoint inventory
   */
  async generateEndpointInventory(endpoints: BackendEndpoint[]): Promise<EndpointInventory> {
    // Group endpoints by category
    const categories: Record<EndpointCategory, BackendEndpoint[]> = {
      AUTH: [],
      USERS: [],
      LOANS: [],
      SAVINGS: [],
      DASHBOARD: [],
      ADMIN: [],
      REPORTS: []
    };

    endpoints.forEach(endpoint => {
      if (categories[endpoint.category]) {
        categories[endpoint.category].push(endpoint);
      }
    });

    // Sort endpoints within each category by path
    Object.keys(categories).forEach(category => {
      categories[category as EndpointCategory].sort((a, b) => a.path.localeCompare(b.path));
    });

    return {
      endpoints,
      categories,
      totalCount: endpoints.length,
      lastUpdated: new Date()
    };
  }

  /**
   * Create role-based documentation for different user types
   */
  async createRoleBasedDocumentation(endpoints: BackendEndpoint[], roles: UserRole[]): Promise<RoleDocumentation[]> {
    const roleDocumentation: RoleDocumentation[] = [];

    for (const role of roles) {
      // Filter endpoints accessible by this role
      const accessibleEndpoints = endpoints.filter(endpoint => 
        !endpoint.requiresAuth || endpoint.supportedRoles.includes(role)
      );

      // Generate default permissions for the role
      const permissions: Permission[] = this.generateDefaultPermissions(role);

      // Create examples for key endpoints
      const examples: EndpointExample[] = await this.generateExamplesForRole(accessibleEndpoints, role);

      roleDocumentation.push({
        role,
        accessibleEndpoints,
        permissions,
        examples
      });
    }

    return roleDocumentation;
  }

  /**
   * Generate OpenAPI specification from endpoints
   */
  async generateOpenApiSpec(endpoints: BackendEndpoint[]): Promise<OpenApiSpec> {
    const paths: Record<string, any> = {};
    const schemas: Record<string, JsonSchema> = {};
    const securitySchemes: Record<string, any> = {};

    // Process each endpoint
    endpoints.forEach(endpoint => {
      const pathKey = endpoint.path;
      
      if (!paths[pathKey]) {
        paths[pathKey] = {};
      }

      // Create operation object
      const operation: any = {
        summary: endpoint.description || `${endpoint.method} ${endpoint.path}`,
        description: endpoint.description,
        tags: endpoint.tags,
        operationId: `${endpoint.method.toLowerCase()}${this.pathToOperationId(endpoint.path)}`,
        responses: this.generateOpenApiResponses(endpoint),
      };

      // Add security if required
      if (endpoint.requiresAuth) {
        operation.security = [{ bearerAuth: [] }];
      }

      // Add request body for POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.requestSchema) {
        operation.requestBody = {
          required: true,
          content: {
            'application/json': {
              schema: endpoint.requestSchema
            }
          }
        };
      }

      // Add parameters for path/query parameters
      const parameters = this.extractParametersFromPath(endpoint.path);
      if (parameters.length > 0) {
        operation.parameters = parameters;
      }

      paths[pathKey][endpoint.method.toLowerCase()] = operation;

      // Collect schemas
      if (endpoint.requestSchema) {
        const schemaName = `${this.pathToSchemaName(endpoint.path)}Request`;
        schemas[schemaName] = endpoint.requestSchema;
      }
      if (endpoint.responseSchema) {
        const schemaName = `${this.pathToSchemaName(endpoint.path)}Response`;
        schemas[schemaName] = endpoint.responseSchema;
      }
    });

    // Add security schemes
    securitySchemes.bearerAuth = {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    };

    return {
      openapi: '3.0.0',
      info: {
        title: 'KAYTOP API',
        version: '1.0.0',
        description: 'Comprehensive API documentation for KAYTOP application'
      },
      servers: [
        {
          url: 'https://kaytop-production.up.railway.app',
          description: 'Production server'
        }
      ],
      paths,
      components: {
        schemas,
        securitySchemes
      }
    };
  }

  /**
   * Generate markdown documentation
   */
  async generateMarkdownDocumentation(endpoints: BackendEndpoint[]): Promise<string> {
    const inventory = await this.generateEndpointInventory(endpoints);
    
    let markdown = '# API Endpoint Documentation\n\n';
    markdown += `Generated on: ${inventory.lastUpdated.toISOString()}\n`;
    markdown += `Total Endpoints: ${inventory.totalCount}\n\n`;

    // Table of contents
    markdown += '## Table of Contents\n\n';
    Object.keys(inventory.categories).forEach(category => {
      const categoryEndpoints = inventory.categories[category as EndpointCategory];
      if (categoryEndpoints.length > 0) {
        markdown += `- [${category}](#${category.toLowerCase()})\n`;
      }
    });
    markdown += '\n';

    // Generate documentation for each category
    Object.entries(inventory.categories).forEach(([category, categoryEndpoints]) => {
      if (categoryEndpoints.length === 0) return;

      markdown += `## ${category}\n\n`;
      
      categoryEndpoints.forEach(endpoint => {
        markdown += `### ${endpoint.method} ${endpoint.path}\n\n`;
        
        if (endpoint.description) {
          markdown += `${endpoint.description}\n\n`;
        }

        // Authentication
        if (endpoint.requiresAuth) {
          markdown += `**Authentication:** Required\n`;
          markdown += `**Roles:** ${endpoint.supportedRoles.join(', ')}\n\n`;
        } else {
          markdown += `**Authentication:** Not required\n\n`;
        }

        // Status codes
        markdown += `**Status Codes:** ${endpoint.statusCodes.join(', ')}\n\n`;

        // Request schema
        if (endpoint.requestSchema) {
          markdown += `**Request Schema:**\n\`\`\`json\n${JSON.stringify(endpoint.requestSchema, null, 2)}\n\`\`\`\n\n`;
        }

        // Response schema
        if (endpoint.responseSchema) {
          markdown += `**Response Schema:**\n\`\`\`json\n${JSON.stringify(endpoint.responseSchema, null, 2)}\n\`\`\`\n\n`;
        }

        // Errors
        if (endpoint.errors.length > 0) {
          markdown += `**Error Responses:**\n`;
          endpoint.errors.forEach(error => {
            markdown += `- ${error.statusCode}: ${error.message}\n`;
          });
          markdown += '\n';
        }

        markdown += '---\n\n';
      });
    });

    return markdown;
  }

  /**
   * Generate endpoint examples with sample requests/responses
   */
  async generateExamples(endpoints: BackendEndpoint[]): Promise<Record<string, any>> {
    const examples: Record<string, any> = {};

    endpoints.forEach(endpoint => {
      const exampleKey = `${endpoint.method}_${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      examples[exampleKey] = {
        endpoint: {
          method: endpoint.method,
          path: endpoint.path,
          description: endpoint.description
        },
        curl: this.generateCurlExample(endpoint),
        request: this.generateSampleRequest(endpoint),
        response: this.generateSampleResponse(endpoint)
      };
    });

    return examples;
  }

  // Private helper methods

  private generateDefaultPermissions(role: UserRole): Permission[] {
    const permissionMap: Record<UserRole, Permission[]> = {
      system_admin: [
        { resource: '*', action: '*' },
      ],
      branch_manager: [
        { resource: 'branches', action: 'read' },
        { resource: 'branches', action: 'update' },
        { resource: 'users', action: 'read' },
        { resource: 'loans', action: 'read' },
        { resource: 'savings', action: 'read' },
      ],
      account_manager: [
        { resource: 'customers', action: 'read' },
        { resource: 'customers', action: 'create' },
        { resource: 'customers', action: 'update' },
        { resource: 'loans', action: 'read' },
        { resource: 'savings', action: 'read' },
      ],
      hq_manager: [
        { resource: 'reports', action: 'read' },
        { resource: 'dashboard', action: 'read' },
        { resource: 'branches', action: 'read' },
      ],
      credit_officer: [
        { resource: 'loans', action: 'read' },
        { resource: 'loans', action: 'create' },
        { resource: 'loans', action: 'update' },
        { resource: 'customers', action: 'read' },
      ],
      customer: [
        { resource: 'profile', action: 'read' },
        { resource: 'profile', action: 'update' },
        { resource: 'loans', action: 'read', conditions: { owner: 'self' } },
        { resource: 'savings', action: 'read', conditions: { owner: 'self' } },
      ]
    };

    return permissionMap[role] || [];
  }

  private async generateExamplesForRole(endpoints: BackendEndpoint[], role: UserRole): Promise<EndpointExample[]> {
    // Select key endpoints for examples (max 5 per role)
    const keyEndpoints = endpoints.slice(0, 5);
    
    return keyEndpoints.map(endpoint => ({
      endpoint,
      sampleRequest: this.generateSampleRequest(endpoint),
      sampleResponse: this.generateSampleResponse(endpoint),
      curlExample: this.generateCurlExample(endpoint)
    }));
  }

  private generateOpenApiResponses(endpoint: BackendEndpoint): Record<string, any> {
    const responses: Record<string, any> = {};

    endpoint.statusCodes.forEach(statusCode => {
      const description = this.getStatusCodeDescription(statusCode);
      
      responses[statusCode.toString()] = {
        description,
        content: statusCode < 400 && endpoint.responseSchema ? {
          'application/json': {
            schema: endpoint.responseSchema
          }
        } : undefined
      };
    });

    // Add error responses
    endpoint.errors.forEach(error => {
      responses[error.statusCode.toString()] = {
        description: error.message,
        content: error.schema ? {
          'application/json': {
            schema: error.schema
          }
        } : undefined
      };
    });

    return responses;
  }

  private pathToOperationId(path: string): string {
    return path
      .split('/')
      .filter(segment => segment && !segment.startsWith('{'))
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join('');
  }

  private pathToSchemaName(path: string): string {
    return this.pathToOperationId(path);
  }

  private extractParametersFromPath(path: string): any[] {
    const parameters: any[] = [];
    const pathParams = path.match(/\{([^}]+)\}/g);
    
    if (pathParams) {
      pathParams.forEach(param => {
        const paramName = param.slice(1, -1);
        parameters.push({
          name: paramName,
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: `${paramName} parameter`
        });
      });
    }

    return parameters;
  }

  private generateCurlExample(endpoint: BackendEndpoint): string {
    let curl = `curl -X ${endpoint.method} \\
  'https://kaytop-production.up.railway.app${endpoint.path}'`;

    if (endpoint.requiresAuth) {
      curl += ` \\
  -H 'Authorization: Bearer YOUR_TOKEN'`;
    }

    curl += ` \\
  -H 'Content-Type: application/json'`;

    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.requestSchema) {
      const sampleData = this.generateSampleRequest(endpoint);
      curl += ` \\
  -d '${JSON.stringify(sampleData, null, 2)}'`;
    }

    return curl;
  }

  private generateSampleRequest(endpoint: BackendEndpoint): any {
    if (!endpoint.requestSchema) return null;

    return this.generateSampleFromSchema(endpoint.requestSchema);
  }

  private generateSampleResponse(endpoint: BackendEndpoint): any {
    if (!endpoint.responseSchema) return null;

    return this.generateSampleFromSchema(endpoint.responseSchema);
  }

  private generateSampleFromSchema(schema: JsonSchema): any {
    if (!schema.type) return null;

    switch (schema.type) {
      case 'object':
        const obj: any = {};
        if (schema.properties) {
          Object.entries(schema.properties).forEach(([key, propSchema]) => {
            obj[key] = this.generateSampleFromSchema(propSchema);
          });
        }
        return obj;
      
      case 'array':
        if (schema.items) {
          const itemSchema = Array.isArray(schema.items) ? schema.items[0] : schema.items;
          return [this.generateSampleFromSchema(itemSchema)];
        }
        return [];
      
      case 'string':
        if (schema.enum) return schema.enum[0];
        if (schema.format === 'email') return 'user@example.com';
        if (schema.format === 'date') return '2023-01-01';
        if (schema.format === 'date-time') return '2023-01-01T00:00:00Z';
        return 'string';
      
      case 'number':
        return 123;
      
      case 'boolean':
        return true;
      
      default:
        return null;
    }
  }

  private getStatusCodeDescription(statusCode: number): string {
    const descriptions: Record<number, string> = {
      200: 'Success',
      201: 'Created',
      204: 'No Content',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      500: 'Internal Server Error'
    };

    return descriptions[statusCode] || `HTTP ${statusCode}`;
  }
}