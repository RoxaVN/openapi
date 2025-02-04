import { json, LoaderFunctionArgs } from '@remix-run/node';
import { TSchema } from '@roxavn/core/base';
import { moduleManager, ServerModule } from '@roxavn/core/server';

export const mapProperties = (name: string, schema: TSchema) => {
  return Object.entries(schema.properties ?? []).map(([key, value]) => {
    const {
      type: valueType = undefined,
      description,
      examples,
      ...schemaKeywords
    } = value as any;
    return {
      description,
      examples,
      schema: { type: valueType, ...schemaKeywords },
      in: name,
      name: key,
      required: schema.required?.includes(key) ?? false,
    };
  });
};

export async function loader({ request }: LoaderFunctionArgs) {
  if (process.env.NODE_ENV === 'development') {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const moduleInfo = moduleManager.modules.find((m) => m.name === query);
    if (query && moduleInfo) {
      const apis = ServerModule.apiRoutes
        .filter((a) => a.api.module.name === query)
        .map((a) => a.api);
      const paths: any = {};
      for (const api of apis) {
        if (!paths[api.path]) {
          paths[api.path] = {};
        }
        paths[api.path][api.method.toLowerCase()] = {
          security: api.authorization && [{ tokenAuth: [] }],
          tags: [api.source.name],
          responses: {
            200: {
              description: 'Default Response',
              content: {
                'application/json': { schema: api.response },
              },
            },
          },
          requestBody:
            api.method !== 'GET'
              ? {
                  content: {
                    'application/json': { schema: api.request },
                  },
                  required: true,
                }
              : undefined,
          parameters:
            api.method === 'GET'
              ? mapProperties('query', api.request)
              : undefined,
        };
      }

      return json({
        openapi: '3.0.3',
        info: {
          title: moduleInfo.name,
          description: (moduleInfo as any).description,
          version: moduleInfo.version,
        },
        components: {
          securitySchemes: {
            tokenAuth: {
              description: 'Format: Bearer {access-token}',
              type: 'apiKey',
              name: 'Authorization',
              in: 'header',
            },
          },
          schemas: {},
        },
        paths,
      });
    }
  }
  throw new Response(null, { status: 404, statusText: 'Not Found' });
}
