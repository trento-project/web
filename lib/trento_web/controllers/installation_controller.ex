defmodule TrentoWeb.InstallationController do
  use TrentoWeb, :controller

  alias OpenApiSpex.Schema

  use OpenApiSpex.ControllerSpecs

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
    key = Trento.Installation.get_api_key()

    conn
    |> put_status(:ok)
    |> json(%{"api_key" => key})
  end
end
