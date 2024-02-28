defmodule TrentoWeb.V1.InstallationController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias OpenApiSpex.Schema
  alias Trento.Settings
  alias TrentoWeb.Auth.ApiKey

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :get_api_key,
    summary: "Retrieve API Key",
    tags: ["Platform"],
    description: "Retrieve the generated API Key. Needed for Agents installation",
    responses: [
      ok:
        {"The generated API Key", "application/json",
         %Schema{
           title: "ApiKey",
           type: :object,
           properties: %{
             api_key: %Schema{
               type: :string
             }
           }
         }}
    ]

  @spec get_api_key(Plug.Conn.t(), any) :: Plug.Conn.t()
  def get_api_key(conn, _) do
    with {:ok, api_key_settings} <- Settings.get_api_key_settings() do
      render(conn, "api_key.json", %{
        api_key: generate_api_key!(api_key_settings)
      })
    end
  end

  defp generate_api_key!(%{
         jti: jti,
         api_key_expire_at: api_key_expire_at,
         api_key_created_at: api_key_created_at
       }) do
    ApiKey.generate_api_key!(%{"jti" => jti}, api_key_created_at, api_key_expire_at)
  end
end
