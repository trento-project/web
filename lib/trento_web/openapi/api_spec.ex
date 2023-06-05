defmodule TrentoWeb.OpenApi.ApiSpec do
  @moduledoc """
  OpenApi specification entry point

  `api_version` must be provided to specify the version of this openapi specification

  Example:
    use TrentoWeb.OpenApi.ApiSpec,
      api_version: "v1"
  """

  defmacro __using__(opts) do
    api_version =
      Keyword.get(opts, :api_version) || raise ArgumentError, "expected :api_version option"

    quote do
      alias OpenApiSpex.{
        Components,
        Info,
        OpenApi,
        Paths,
        SecurityScheme,
        Server,
        Tag
      }

      alias TrentoWeb.{Endpoint, Router}
      @behaviour OpenApi

      @impl OpenApi
      def spec do
        OpenApiSpex.resolve_schema_modules(%OpenApi{
          servers: [
            endpoint()
          ],
          info: %Info{
            title: "Trento",
            description: to_string(Application.spec(:trento, :description)),
            version: to_string(Application.spec(:trento, :vsn))
          },
          components: %Components{
            securitySchemes: %{"authorization" => %SecurityScheme{type: "http", scheme: "bearer"}}
          },
          security: [%{"authorization" => []}],
          paths: build_paths_for_version(unquote(api_version)),
          tags: [
            %Tag{
              name: "Target Infrastructure",
              description: "Providing access to the discovered target infrastructure"
            },
            %Tag{
              name: "Checks",
              description: "Providing Checks related feature"
            },
            %Tag{
              name: "Platform",
              description: "Providing access to Trento Platform features"
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
          %OpenApiSpex.Server{url: "https://demo.trento-project.io"}
        end
      end

      defp build_paths_for_version(version) do
        excluded_versions = List.delete(Router.available_api_versions(), version)

        Router
        |> Paths.from_router()
        |> Enum.reject(fn {path, _info} ->
          current_version =
            path
            |> String.trim("/")
            |> String.split("/")
            |> Enum.at(1)

          Enum.member?(excluded_versions, current_version)
        end)
        |> Map.new()
      end
    end
  end
end
