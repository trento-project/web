defmodule TrentoWeb.OpenApi.ApiSpec do
  @moduledoc """
  OpenApi specification entry point

  `api_version` must be provided to specify the version of this openapi specification

  Example:
    use TrentoWeb.OpenApi.ApiSpec,
      api_version: "v1"

    # For unversioned endpoints:
    use TrentoWeb.OpenApi.ApiSpec,
      api_version: "unversioned"
  """

  defmacro __using__(opts) do
    api_version =
      Keyword.get(opts, :api_version) || raise ArgumentError, "expected :api_version option"

    quote do
      alias OpenApiSpex.{
        Components,
        Info,
        License,
        Contact,
        OpenApi,
        Paths,
        SecurityScheme,
        Server,
        Tag
      }

      alias TrentoWeb.{Endpoint, Router}
      @behaviour OpenApi

      @impl OpenApi
      def spec(router \\ Router) do
        OpenApiSpex.resolve_schema_modules(%OpenApi{
          servers: [
            endpoint()
          ],
          info: %Info{
            title: "Trento",
            description: to_string(Application.spec(:trento, :description)),
            version: to_string(Application.spec(:trento, :vsn)) <> "-" <> unquote(api_version),
            license: %OpenApiSpex.License{
              name: "Apache 2.0",
              url: "https://www.apache.org/licenses/LICENSE-2.0"
            },
            contact: %Contact{
              name: "Trento Project",
              url: "https://www.trento-project.io",
              email: "trento-project@suse.com"
            }
          },
          components: %Components{
            securitySchemes: %{
              "authorization" => %SecurityScheme{
                type: "http",
                scheme: "bearer",
                description: "Bearer token authentication"
              }
            }
          },
          security: [%{"authorization" => []}],
          paths: build_paths_for_version(unquote(api_version), router),
          tags: [
            %Tag{
              name: "Agent",
              description: "Agent communication and data collection."
            },
            %Tag{
              name: "Auth",
              description: "Authentication and session management."
            },
            %Tag{
              name: "Charts",
              description: "Host monitoring and performance charts."
            },
            %Tag{
              name: "Checks",
              description: "Providing Checks related feature."
            },
            %Tag{
              name: "Operations",
              description: "SAP system and infrastructure operations."
            },
            %Tag{
              name: "Platform",
              description: "Providing access to Trento Platform features."
            },
            %Tag{
              name: "Profile",
              description: "User profile and personal settings."
            },
            %Tag{
              name: "Settings",
              description: "Platform configuration and settings management."
            },
            %Tag{
              name: "Tags",
              description: "Resource tagging and organization."
            },
            %Tag{
              name: "Target Infrastructure",
              description: "Providing access to the discovered target infrastructure."
            },
            %Tag{
              name: "User Management",
              description: "User account and permissions management."
            }
          ]
        })
      end

      defp endpoint do
        if Process.whereis(Endpoint) do
          # Populate the Server info from a phoenix endpoint
          Server.from_endpoint(Endpoint)
        else
          # If the endpoint is not running, use a placeholder
          # this happens when generarting openapi.json with --start-app=false
          # e.g. mix openapi.spec.json --start-app=false --spec WandaWeb.ApiSpec
          %OpenApiSpex.Server{
            url: "https://demo.trento-project.io",
            description: "Trento demo server."
          }
        end
      end

      defp build_paths_for_version(version, router) do
        router
        |> Paths.from_router()
        |> Enum.reject(fn {path, _info} ->
          current_version =
            path
            |> String.trim("/")
            |> String.split("/")
            |> Enum.at(1)

          cond do
            # When generating "unversioned" version, include only unversioned endpoints
            version == "unversioned" ->
              current_version in router.available_api_versions()

            # When generating specific version, exclude unversioned and other versions
            true ->
              excluded_versions = List.delete(router.available_api_versions(), version)

              current_version in excluded_versions or
                current_version not in router.available_api_versions()
          end
        end)
        |> Map.new()
      end
    end
  end
end
