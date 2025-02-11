import {
  useLoaderData,
  type LinksFunction,
  type MetaFunction,
} from 'react-router';

import { ServerModule } from '@roxavn/core/server';
import { useEffect } from 'react';

export async function loader() {
  if (process.env.NODE_ENV === 'development') {
    const result = new Set<string>();
    for (const m of ServerModule.apiRoutes) {
      result.add(m.api.module.name);
    }
    return [...result].map((m) => ({
      name: m,
      url: './openapi/json?q=' + decodeURIComponent(m),
    }));
  }
  throw new Response(null, { status: 404, statusText: 'Not Found' });
}

export default function () {
  const urls = useLoaderData<typeof loader>();

  useEffect(() => {
    const w: any = window;
    w.ui = w.SwaggerUIBundle({
      urls,
      dom_id: '#swagger-ui',
      layout: 'StandaloneLayout',
      presets: [w.SwaggerUIBundle.presets.apis, w.SwaggerUIStandalonePreset],
      docExpansion: 'list',
      deepLinking: false,
      persistAuthorization: true,
      tagsSorter: 'alpha',
    });
  }, []);

  return (
    <div>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
    </div>
  );
}

export const meta: MetaFunction = () => [{ title: 'OpenAPI Documentation' }];

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css',
    },
  ];
};
