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
        Contact,
        Info,
        License,
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
              name: "MCP",
              description:
                "Exposes endpoints as tools for Model Context Protocol (MCP) integration, enabling those endpoints to be consumed by any LLM."
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
        if Process.whereis(Endpoint) do
          # Populate the Server info from a phoenix endpoint
          Server.from_endpoint(Endpoint)
        else
          # If the endpoint is not running, use a placeholder
          # this happens when generating openapi.json with --start-app=false
          # e.g. mix openapi.spec.json --start-app=false --spec WandaWeb.ApiSpec
          %OpenApiSpex.Server{
            url: "https://demo.trento-project.io",
            description:
              "This is the Trento demo server, provided for testing and demonstration purposes."
          }
        end
      end

      defp build_paths_for_version(version, router) do
        available_versions = router.available_api_versions()

        excluded_versions = List.delete(available_versions, version)
        actual_versions = List.delete(available_versions, "unversioned")

        router
        |> Paths.from_router()
        |> Enum.reject(fn {path, _info} ->
          current_version =
            path
            |> String.trim("/")
            |> String.split("/")
            |> Enum.at(1)
            |> map_version(actual_versions)

          Enum.member?(excluded_versions, current_version)
        end)
        |> Map.new()
      end

      defp map_version(version, actual_versions) do
        case version in actual_versions do
          true -> version
          _ -> "unversioned"
        end
      end
    end
  end
end
