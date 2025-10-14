defmodule TrentoWeb.OpenApi.ApiSpec do
  @moduledoc """
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
  """
  alias TrentoWeb.OpenApi.ApiSpec

  alias OpenApiSpex.Paths

  defmacro __using__(opts) do
    api_version =
      Keyword.get(opts, :api_version) || raise ArgumentError, "expected :api_version option"

    quote do
      alias OpenApiSpex.{
        Components,
        Contact,
        Info,
        License,
        OpenApi,
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
            version: ApiSpec.build_version(unquote(api_version)),
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
          paths: ApiSpec.build_paths_for_version(unquote(api_version), router),
          tags: [
            %Tag{
              name: "Agent",
              description:
                "Handles communication with agents and collects data from managed systems in the infrastructure."
            },
            %Tag{
              name: "Auth",
              description:
                "Manages authentication, user login, and session lifecycle for secure access to the platform."
            },
            %Tag{
              name: "Charts",
              description:
                "Provides monitoring and visualization of host performance metrics and system health over time."
            },
            %Tag{
              name: "Checks",
              description:
                "Offers features for running automated checks and validations to ensure system compliance and reliability."
            },
            %Tag{
              name: "Operations",
              description:
                "Supports a variety of operations for SAP systems and infrastructure, including resource management and workflow execution."
            },
            %Tag{
              name: "Platform",
              description:
                "Gives access to core Trento Platform capabilities and general platform information for users and administrators."
            },
            %Tag{
              name: "Profile",
              description:
                "Allows users to view and update their personal profile information and preferences within the platform."
            },
            %Tag{
              name: "Settings",
              description:
                "Enables configuration and management of platform-wide settings, including integrations and environment options."
            },
            %Tag{
              name: "Tags",
              description:
                "Facilitates resource tagging and organization to improve searchability and logical grouping of assets."
            },
            %Tag{
              name: "Target Infrastructure",
              description:
                "Provides access to information and management features for the discovered target infrastructure resources."
            },
            %Tag{
              name: "User Management",
              description:
                "Handles user account creation, permissions, and administrative controls for managing platform users."
            }
          ]
        })
      end

      defp endpoint do
        oas_server_url = Application.fetch_env!(:trento, :oas_server_url)

        cond do
          not is_nil(oas_server_url) ->
            %OpenApiSpex.Server{
              url: oas_server_url
            }

          Process.whereis(Endpoint) ->
            Server.from_endpoint(Endpoint)

          true ->
            %OpenApiSpex.Server{
              url: "https://demo.trento-project.io",
              description:
                "This is the Trento demo server, provided for testing and demonstration purposes."
            }
        end
      end
    end
  end

  def build_version("all"), do: to_string(Application.spec(:trento, :vsn))
  def build_version(version), do: to_string(Application.spec(:trento, :vsn)) <> "-" <> version

  def build_paths_for_version("all", router), do: Paths.from_router(router)

  def build_paths_for_version(version, router) do
    available_versions = router.available_api_versions()

    router
    |> Paths.from_router()
    |> Enum.filter(fn {path, _info} ->
      path
      |> String.trim("/")
      |> String.split("/")
      |> Enum.at(1)
      |> include_path?(version, available_versions)
    end)
    |> Map.new()
  end

  defp include_path?(route_api_version, "unversioned", available_versions),
    do: not Enum.member?(available_versions, route_api_version)

  defp include_path?(version, version, _available_versions),
    do: true

  defp include_path?(_route_api_version, _api_version, _available_versions),
    do: false
end
