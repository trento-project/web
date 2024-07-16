defmodule TrentoWeb.V1.SUMACredentialsController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.SoftwareUpdates

  alias TrentoWeb.OpenApi.V1.Schema
  alias TrentoWeb.OpenApi.V1.Schema.SUMACredentials
  alias TrentoWeb.OpenApi.V1.Schema.UnprocessableEntity

  plug TrentoWeb.Plugs.LoadUserPlug

  plug Bodyguard.Plug.Authorize,
    policy: Trento.SoftwareUpdates.Policy,
    action: {Phoenix.Controller, :action_name},
    user: {Pow.Plug, :current_user},
    params: {__MODULE__, :get_policy_resource},
    fallback: TrentoWeb.FallbackController

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :show,
    summary: "Gets the SUMA credentials",
    tags: ["Platform"],
    description: "Gets the saved credentials for SUSE Manager",
    responses: [
      ok: {"The SUSE Manager credentials", "application/json", SUMACredentials.Settings},
      not_found: Schema.NotFound.response()
    ]

  @spec show(Plug.Conn.t(), any) :: Plug.Conn.t()
  def show(conn, _) do
    with {:ok, settings} <- SoftwareUpdates.get_settings() do
      render(conn, "suma_credentials.json", %{settings: settings})
    end
  end

  operation :create,
    summary: "Saves the SUMA credentials",
    tags: ["Platform"],
    description: "Saves credentials for SUSE Manager",
    request_body:
      {"SaveSUMACredentialsRequest", "application/json",
       SUMACredentials.SaveSUMACredentialsRequest},
    responses: [
      created: {"Settings saved successfully", "application/json", SUMACredentials.Settings},
      unprocessable_entity: UnprocessableEntity.response()
    ]

  @spec create(Plug.Conn.t(), any) :: Plug.Conn.t()
  def create(conn, _) do
    settings_params = OpenApiSpex.body_params(conn)

    with {:ok, saved_settings} <- SoftwareUpdates.save_settings(settings_params) do
      conn
      |> put_status(:created)
      |> render("suma_credentials.json", %{settings: saved_settings})
    end
  end

  operation :update,
    summary: "Updates the SUMA credentials",
    tags: ["Platform"],
    description: "Updates credentials for SUSE Manager",
    request_body:
      {"UpdateSUMACredentialsRequest", "application/json",
       SUMACredentials.UpdateSUMACredentialsRequest},
    responses: [
      ok: {"Settings saved successfully", "application/json", SUMACredentials.Settings},
      unprocessable_entity: UnprocessableEntity.response()
    ]

  @spec update(Plug.Conn.t(), any) :: Plug.Conn.t()
  def update(conn, _) do
    update_settings_paylod = OpenApiSpex.body_params(conn)

    with {:ok, saved_settings} <- SoftwareUpdates.change_settings(update_settings_paylod) do
      conn
      |> put_status(:ok)
      |> render("suma_credentials.json", %{settings: saved_settings})
    end
  end

  operation :delete,
    summary: "Clears the SUMA credentials",
    tags: ["Platform"],
    description: "Clears the saved credentials for SUSE Manager",
    responses: [
      no_content: "Settings cleared successfully"
    ]

  @spec delete(Plug.Conn.t(), any) :: Plug.Conn.t()
  def delete(conn, _) do
    :ok = SoftwareUpdates.clear_settings()
    send_resp(conn, :no_content, "")
  end

  operation :test,
    summary: "Tests connection with SUMA",
    tags: ["Platform"],
    description: "Tests connection with SUMA with the saved credentials",
    responses: [
      ok: "The connection with SUMA was successful",
      unprocessable_entity:
        {"The connection with SUMA failed", "application/json", UnprocessableEntity}
    ]

  @spec test(Plug.Conn.t(), any) :: Plug.Conn.t()
  def test(conn, _) do
    with :ok <- SoftwareUpdates.test_connection_settings() do
      conn
      |> put_status(:ok)
      |> json("")
    end
  end

  def get_policy_resource(_), do: Trento.Settings.SuseManagerSettings
end
