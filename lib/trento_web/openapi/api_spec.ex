defmodule TrentoWeb.OpenApi.ApiSpec do
  @moduledoc """
  OpenApi specification entry point
  """

  alias OpenApiSpex.{Info, OpenApi, Paths, Server, Tag}
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
      # Populate the paths from a phoenix router
      paths: Paths.from_router(Router),
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
end
