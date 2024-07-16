defmodule TrentoWeb.V1.SettingsController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.ActivityLog
  alias Trento.Settings
  alias Trento.SoftwareUpdates
  alias TrentoWeb.OpenApi.V1.Schema
  alias TrentoWeb.Plugs.AuthenticateAPIKeyPlug

  plug TrentoWeb.Plugs.LoadUserPlug

  plug Bodyguard.Plug.Authorize,
    policy: Trento.Settings.Policy,
    action: {Phoenix.Controller, :action_name},
    user: {Pow.Plug, :current_user},
    params: {__MODULE__, :get_policy_resource},
    fallback: TrentoWeb.FallbackController

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :settings,
    summary: "Platform Settings",
    tags: ["Platform"],
    description: "Provides the Platform Settings for the current installation.",
    responses: [
      ok: {"Platform Settings", "application/json", Schema.Platform.Settings}
    ]

  @spec settings(Plug.Conn.t(), any) :: Plug.Conn.t()
  def settings(conn, _) do
    render(conn, "settings.json",
      settings: %{
        eula_accepted: false,
        premium_subscription: Settings.premium?()
      }
    )
  end

  operation :accept_eula,
    summary: "Accept Eula",
    tags: ["Platform"],
    deprecated: true,
    description: "Accepting EULA allows the end user to use the platform",
    responses: [
      ok:
        "EULA acceptance has been correctly registered and the user may continue using the platform"
    ]

  @spec accept_eula(Plug.Conn.t(), any) :: Plug.Conn.t()
  def accept_eula(conn, _) do
    json(conn, %{})
  end

  operation :get_api_key_settings,
    summary: "Get Api key settings",
    tags: ["Platform"],
    responses: [
      ok: {"Api Key settings", "application/json", Schema.Platform.ApiKeySettings},
      not_found: Schema.NotFound.response()
    ]

  def get_api_key_settings(conn, _) do
    with {:ok, api_key_settings} <- Settings.get_api_key_settings() do
      settings_with_key =
        Map.put(
          api_key_settings,
          :generated_api_key,
          AuthenticateAPIKeyPlug.generate_api_key!(api_key_settings)
        )

      render(conn, "api_key_settings.json", %{
        settings: settings_with_key
      })
    end
  end

  operation :update_api_key_settings,
    summary: "Updates the Api key settings",
    tags: ["Platform"],
    request_body:
      {"ApiKeySettingsUpdateRequest", "application/json",
       Schema.Platform.ApiKeySettingsUpdateRequest},
    responses: [
      ok: {"Settings saved successfully", "application/json", Schema.Platform.ApiKeySettings},
      unprocessable_entity: Schema.UnprocessableEntity.response(),
      not_found: Schema.NotFound.response()
    ]

  def update_api_key_settings(conn, _) do
    %{expire_at: expire_at} = OpenApiSpex.body_params(conn)

    with {:ok, updated_settings} <- Settings.update_api_key_settings(expire_at) do
      api_key =
        Map.put(
          updated_settings,
          :generated_api_key,
          AuthenticateAPIKeyPlug.generate_api_key!(updated_settings)
        )

      render(conn, "api_key_settings.json", %{
        settings: api_key
      })
    end
  end

  operation :update_activity_log_settings,
    summary: "Updates the Activity Log settings",
    tags: ["Platform"],
    request_body:
      {"ActivityLogSettings", "application/json", Schema.Platform.ActivityLogSettings},
    responses: [
      ok:
        {"Activity Log settings saved successfully", "application/json",
         Schema.Platform.ActivityLogSettings},
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def update_activity_log_settings(
        conn,
        _
      ) do
    %{retention_time: %{value: retention_period, unit: retention_period_unit}} =
      OpenApiSpex.body_params(conn)

    with {:ok, updated_settings} <-
           ActivityLog.change_retention_period(retention_period, retention_period_unit) do
      render(conn, "activity_log_settings.json", %{
        activity_log_settings: updated_settings
      })
    end
  end

  operation :get_activity_log_settings,
    summary: "Fetches the Activity Log settings",
    tags: ["Platform"],
    responses: [
      ok:
        {"Activity Log settings fetched successfully", "application/json",
         Schema.Platform.ActivityLogSettings},
      not_found: Schema.NotFound.response()
    ]

  def get_activity_log_settings(conn, _) do
    with {:ok, settings} <- ActivityLog.get_settings() do
      render(conn, "activity_log_settings.json", %{
        activity_log_settings: settings
      })
    end
  end

  operation :get_suse_manager_settings,
    summary: "Gets the Suse manager Settings",
    tags: ["Platform"],
    description: "Gets the saved settings for Suse Manager",
    responses: [
      ok:
        {"The Suse Manager credentials", "application/json", Schema.Platform.SuseManagerSettings},
      not_found: Schema.NotFound.response()
    ]

  @spec get_suse_manager_settings(Plug.Conn.t(), any) :: Plug.Conn.t()
  def get_suse_manager_settings(conn, _) do
    with {:ok, settings} <- Settings.get_suse_manager_settings() do
      render(conn, "suse_manager.json", %{settings: settings})
    end
  end

  operation :save_suse_manager_settings,
    summary: "Saves the Suse manager settings",
    tags: ["Platform"],
    description: "Saves credentials for Suse manager",
    request_body:
      {"SaveSuseManagerSettingsRequest", "application/json",
       Schema.Platform.SaveSuseManagerSettingsRequest},
    responses: [
      created:
        {"Settings saved successfully", "application/json", Schema.Platform.SuseManagerSettings},
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  @spec save_suse_manager_settings(Plug.Conn.t(), any) :: Plug.Conn.t()
  def save_suse_manager_settings(conn, _) do
    settings_params = OpenApiSpex.body_params(conn)

    with {:ok, saved_settings} <- Settings.save_suse_manager_settings(settings_params) do
      conn
      |> put_status(:created)
      |> render("suse_manager.json", %{settings: saved_settings})
    end
  end

  operation :update_suse_manager_settings,
    summary: "Updates the Suse manager settings",
    tags: ["Platform"],
    description: "Updates Suse manager settings",
    request_body:
      {"UpdateSuseManagerSettingsRequest", "application/json",
       Schema.Platform.UpdateSuseManagerSettingsRequest},
    responses: [
      ok:
        {"Settings saved successfully", "application/json", Schema.Platform.SuseManagerSettings},
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  @spec update_suse_manager_settings(Plug.Conn.t(), any) :: Plug.Conn.t()
  def update_suse_manager_settings(conn, _) do
    update_settings_paylod = OpenApiSpex.body_params(conn)

    with {:ok, saved_settings} <- Settings.change_suse_manager_settings(update_settings_paylod) do
      conn
      |> put_status(:ok)
      |> render("suse_manager.json", %{settings: saved_settings})
    end
  end

  operation :delete_suse_manager_settings,
    summary: "Clears the Suse manager settings",
    tags: ["Platform"],
    description: "Clears the saved settings for Suse manager",
    responses: [
      no_content: "Settings cleared successfully"
    ]

  @spec delete_suse_manager_settings(Plug.Conn.t(), any) :: Plug.Conn.t()
  def delete_suse_manager_settings(conn, _) do
    :ok = Settings.clear_suse_manager_settings()
    send_resp(conn, :no_content, "")
  end

  operation :test_suse_manager_settings,
    summary: "Tests connection with Suse Manager",
    tags: ["Platform"],
    description: "Tests connection with Suse manager with the saved settings",
    responses: [
      ok: "The connection with Suse manager was successful",
      unprocessable_entity:
        {"The connection with Suse Manager failed", "application/json",
         Schema.UnprocessableEntity}
    ]

  @spec test_suse_manager_settings(Plug.Conn.t(), any) :: Plug.Conn.t()
  def test_suse_manager_settings(conn, _) do
    with :ok <- SoftwareUpdates.test_connection_settings() do
      conn
      |> put_status(:ok)
      |> json("")
    end
  end

  def get_policy_resource(conn) do
    case Phoenix.Controller.action_name(conn) do
      :update_api_key_settings -> Trento.Settings.ApiKeySettings
      :update_activity_log_settings -> Trento.ActivityLog.Settings
      :save_suse_manager_settings -> Trento.Settings.SuseManagerSettings
      :update_suse_manager_settings -> Trento.Settings.SuseManagerSettings
      :delete_suse_manager_settings -> Trento.Settings.SuseManagerSettings
      :test_suse_manager_settings -> Trento.Settings.SuseManagerSettings
      _ -> nil
    end
  end
end
