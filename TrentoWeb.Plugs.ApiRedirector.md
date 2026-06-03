# `TrentoWeb.Plugs.ApiRedirector`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/plugs/api_redirector.ex#L4)

  This Plug is responsible for redirecting api requests without a specific version
  to the latest available version, when the requested path exists

  For example:
    Requesting /api/test, will try to redirect to to /api/<latest version>/test,
    only if the /api/<latest version>/test exists, otherwise, it will continue with the next available version.
    If the route doesn't match with any of the available versions, it returns a not found error.

  router and available_api_versions options should be provided.

  `available_api_versions` option should be a list with the available version from newest to oldest.

  For example: ["v3", "v2", "v1"]

---

*Consult [api-reference.md](api-reference.md) for complete listing*
