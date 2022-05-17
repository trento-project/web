defmodule TrentoWeb.OpenApi.ApiSpec do
  @moduledoc """
  OpenApi specification entry point
  """

  alias OpenApiSpex.{Info, OpenApi, Paths, Server, Tag}
  alias TrentoWeb.{Endpoint, Router}
  @behaviour OpenApi

  @impl OpenApi
  def spec do
    %OpenApi{
      servers: [
        # Populate the Server info from a phoenix endpoint
        Server.from_endpoint(Endpoint)
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
          name: "Landscape",
          description: "Providing access to the discovered target infrastructure"
        },
        %Tag{
          name: "Checks",
          description: "Providing Checks related feature"
        }
      ]
    }
    # Discover request/response schemas from path specs
    |> OpenApiSpex.resolve_schema_modules()
  end
end
