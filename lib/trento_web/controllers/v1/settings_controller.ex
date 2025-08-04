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

  operation :get_api_key_settings,
    summary: "Get Api key settings.",
    description: "Get the settings for API key generation.",
    tags: ["Settings"],
    responses: [
      ok: {"Api Key settings.", "application/json", Schema.Platform.ApiKeySettings},
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

      render(conn, :api_key_settings, %{
        settings: settings_with_key
      })
    end
  end

  @correlation_ttl 15_000
  operation :update_api_key_settings,
    summary: "Updates the Api key settings.",
    description: "Updates the settings for API key generation.",
    tags: ["Settings"],
    request_body:
      {"ApiKeySettingsUpdateRequest.", "application/json",
       Schema.Platform.ApiKeySettingsUpdateRequest},
    responses: [
      ok: {"Settings saved successfully.", "application/json", Schema.Platform.ApiKeySettings},
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

      correlation_id = Process.get(:correlation_id)

      key = ActivityLog.correlation_key(:api_key)

      _ =
        ActivityLog.put_correlation_id(key, correlation_id)

      _ =
        ActivityLog.expire_correlation_id(key, @correlation_ttl)

      render(conn, :api_key_settings, %{
        settings: api_key
      })
    end
  end

  operation :update_activity_log_settings,
    summary: "Updates the Activity Log settings.",
    description: "Updates the settings for the Activity Log, such as retention period.",
    tags: ["Settings"],
    request_body:
      {"ActivityLogSettings.", "application/json", Schema.Platform.ActivityLogSettings},
    responses: [
      ok:
        {"Activity Log settings saved successfully.", "application/json",
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
           Settings.change_activity_log_retention_period(retention_period, retention_period_unit) do
      render(conn, :activity_log_settings, %{
        activity_log_settings: updated_settings
      })
    end
  end

  operation :get_activity_log_settings,
    summary: "Fetches the Activity Log settings.",
    description: "Fetches the settings for the Activity Log, such as retention period.",
    tags: ["Settings"],
    responses: [
      ok:
        {"Activity Log settings fetched successfully.", "application/json",
         Schema.Platform.ActivityLogSettings},
      not_found: Schema.NotFound.response()
    ]

  def get_activity_log_settings(conn, _) do
    case Settings.get_activity_log_settings() do
      {:ok, settings} -> render(conn, :activity_log_settings, %{activity_log_settings: settings})
      {:error, :activity_log_settings_not_configured} -> {:error, :not_found}
    end
  end

  operation :get_suse_manager_settings,
    summary: "Gets the Suse manager Settings.",
    tags: ["Settings"],
    description: "Gets the saved settings for Suse Manager.",
    responses: [
      ok:
        {"The Suse Manager credentials.", "application/json", Schema.Platform.SuseManagerSettings},
      not_found: Schema.NotFound.response()
    ]

  @spec get_suse_manager_settings(Plug.Conn.t(), any) :: Plug.Conn.t()
  def get_suse_manager_settings(conn, _) do
    with {:ok, settings} <- Settings.get_suse_manager_settings() do
      render(conn, :suse_manager, %{settings: settings})
    end
  end

  operation :save_suse_manager_settings,
    summary: "Saves the Suse manager settings.",
    tags: ["Settings"],
    description: "Saves credentials for Suse manager.",
    request_body:
      {"SaveSuseManagerSettingsRequest.", "application/json",
       Schema.Platform.SaveSuseManagerSettingsRequest},
    responses: [
      created:
        {"Settings saved successfully.", "application/json", Schema.Platform.SuseManagerSettings},
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  @spec save_suse_manager_settings(Plug.Conn.t(), any) :: Plug.Conn.t()
  def save_suse_manager_settings(conn, _) do
    settings_params = OpenApiSpex.body_params(conn)

    with {:ok, saved_settings} <- Settings.save_suse_manager_settings(settings_params) do
      conn
      |> put_status(:created)
      |> render(:suse_manager, %{settings: saved_settings})
    end
  end

  operation :update_suse_manager_settings,
    summary: "Updates the Suse manager settings.",
    tags: ["Settings"],
    description: "Updates Suse manager settings.",
    request_body:
      {"UpdateSuseManagerSettingsRequest.", "application/json",
       Schema.Platform.UpdateSuseManagerSettingsRequest},
    responses: [
      ok:
        {"Settings saved successfully.", "application/json", Schema.Platform.SuseManagerSettings},
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  @spec update_suse_manager_settings(Plug.Conn.t(), any) :: Plug.Conn.t()
  def update_suse_manager_settings(conn, _) do
    update_settings_paylod = OpenApiSpex.body_params(conn)

    with {:ok, saved_settings} <- Settings.change_suse_manager_settings(update_settings_paylod) do
      conn
      |> put_status(:ok)
      |> render(:suse_manager, %{settings: saved_settings})
    end
  end

  operation :put_suse_manager_settings,
    summary: "Updates the Suse manager settings.",
    tags: ["Settings"],
    description: "Updates Suse manager settings.",
    request_body:
      {"UpdateSuseManagerSettingsRequest.", "application/json",
       Schema.Platform.UpdateSuseManagerSettingsRequest},
    responses: [
      ok:
        {"Settings saved successfully.", "application/json", Schema.Platform.SuseManagerSettings},
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  @spec put_suse_manager_settings(Plug.Conn.t(), any) :: Plug.Conn.t()
  def put_suse_manager_settings(conn, params), do: update_suse_manager_settings(conn, params)

  operation :delete_suse_manager_settings,
    summary: "Clears the Suse manager settings.",
    tags: ["Settings"],
    description: "Clears the saved settings for Suse manager.",
    responses: [
      no_content: "Settings cleared successfully."
    ]

  @spec delete_suse_manager_settings(Plug.Conn.t(), any) :: Plug.Conn.t()
  def delete_suse_manager_settings(conn, _) do
    :ok = Settings.clear_suse_manager_settings()
    send_resp(conn, :no_content, "")
  end

  operation :test_suse_manager_settings,
    summary: "Tests connection with Suse Manager.",
    tags: ["Settings"],
    description: "Tests connection with Suse manager with the saved settings.",
    responses: [
      ok: "The connection with Suse manager was successful.",
      unprocessable_entity:
        {"The connection with Suse Manager failed.", "application/json",
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

  operation :get_public_keys,
    summary: "Get uploaded public keys.",
    tags: ["Settings"],
    description: "Get uploaded public keys.",
    responses: [
      ok: {"Uploaded public keys.", "application/json", Schema.Platform.PublicKeys}
    ]

  @spec get_public_keys(Plug.Conn.t(), any) :: Plug.Conn.t()
  def get_public_keys(conn, _) do
    certificates = Settings.get_sso_certificates()
    render(conn, :public_keys, %{public_keys: [certificates]})
  end

  operation :get_alerting_settings,
    summary: "Get alerting settings.",
    tags: ["Settings"],
    description: "Get the saved settings for alerting in Trento.",
    responses: [
      ok: {"Alerting settings retrieved.", "application/json", Schema.Platform.AlertingSettings},
      unauthorized: Schema.Unauthorized.response(),
      not_found: Schema.NotFound.response()
    ]

  def get_alerting_settings(conn, _params) do
    with {:ok, settings} <- Settings.get_alerting_settings() do
      conn
      |> put_status(:ok)
      |> render(:alerting_settings, alerting_settings: settings)
    end
  end

  operation :create_alerting_settings,
    summary: "Create alerting settings.",
    description: "Create new persisted settings for alerting in Trento.",
    tags: ["Settings"],
    request_body:
      {"Request body for setting alerting settings.", "application/json",
       Schema.Platform.CreateAlertingSettings},
    responses: [
      created:
        {"Alerting settings successfully modified.", "application/json",
         Schema.Platform.AlertingSettings},
      unauthorized: Schema.Unauthorized.response(),
      forbidden: Schema.Forbidden.response(),
      conflict: Schema.Conflict.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def create_alerting_settings(conn, _params) do
    alerting_body = OpenApiSpex.body_params(conn)

    with {:ok, settings} <- Settings.create_alerting_settings(alerting_body) do
      conn
      |> put_status(:created)
      |> render(:alerting_settings, alerting_settings: settings)
    end
  end

  operation :update_alerting_settings,
    summary: "Update alerting settings.",
    description: "Update persisted settings for alerting in Trento.",
    tags: ["Settings"],
    request_body:
      {"Request body for updating alerting settings.", "application/json",
       Schema.Platform.UpdateAlertingSettings},
    responses: [
      ok:
        {"Alerting settings successfully modified.", "application/json",
         Schema.Platform.AlertingSettings},
      unauthorized: Schema.Unauthorized.response(),
      forbidden: Schema.Forbidden.response(),
      not_found: Schema.NotFound.response(),
      conflict: Schema.Conflict.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def update_alerting_settings(conn, _params) do
    alerting_body = OpenApiSpex.body_params(conn)

    with {:ok, settings} <- Settings.update_alerting_settings(alerting_body) do
      conn
      |> put_status(:ok)
      |> render(:alerting_settings, alerting_settings: settings)
    end
  end

  def get_policy_resource(conn) do
    conn
    |> Phoenix.Controller.action_name()
    |> Trento.Settings.Policy.get_resource()
  end
end
