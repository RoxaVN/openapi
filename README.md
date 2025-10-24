# @roxavn/plugin-openapi

## Environment variables

```
ALLOW_OPENAPI = 1 // by default, the OpenAPI URL will be hidden.
```

The plugin automatically generates OpenAPI documentation for all installed RoxaVN modules with swagger ui. It will create documentation at link

```
http://[DEV_SERVER]/__doc/openapi
```

Install

```bash
npm i -D @roxavn/plugin-openapi
```