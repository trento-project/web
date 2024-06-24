defmodule TrentoWeb.V1.SettingsController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.ActivityLog
  alias Trento.Settings
  alias TrentoWeb.OpenApi.V1.Schema
  alias TrentoWeb.Plugs.AuthenticateAPIKeyPlug

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

  def update_api_key_settings(%{body_params: body_params} = conn, _) do
    %{expire_at: expire_at} = body_params

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

  def update_activity_log_settings(%{body_params: body_params} = conn, _) do
    %{retention_period: retention_period, retention_period_unit: retention_period_unit} =
      body_params

    case ActivityLog.change_retention_period(retention_period, retention_period_unit) do
      {:ok, updated_settings} ->
        render(conn, "activity_log_settings.json", %{
          activity_log_settings: updated_settings
        })

      error ->
        error
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
    case ActivityLog.get_settings() do
      {:ok, settings} ->
        render(conn, "activity_log_settings.json", %{
          activity_log_settings: settings
        })

      _ ->
        {:error, :not_found}
    end
  end
end
