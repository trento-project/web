# `TrentoWeb.OpenApi.ApiSpec`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/openapi/api_spec.ex#L4)

OpenApi specification entry point

`api_version` must be provided to specify the version of this openapi specification

Example:
  use TrentoWeb.OpenApi.ApiSpec,
    api_version: "v1"

  # For all endpoints:
  use TrentoWeb.OpenApi.ApiSpec,
    api_version: "all"

  # For unversioned endpoints:
  use TrentoWeb.OpenApi.ApiSpec,
    api_version: "unversioned"

# `build_paths_for_version`

# `build_version`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
