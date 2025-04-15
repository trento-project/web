defmodule Trento.Settings do
  @moduledoc """
  Provides a set of functions of settings related usecases.
  """

  alias Trento.Repo
  alias Trento.SoftwareUpdates.Discovery, as: SoftwareUpdatesDiscovery

  alias Trento.Settings.{
    ActivityLogSettings,
    AlertingSettings,
    ApiKeySettings,
    InstallationSettings,
    SSOCertificatesSettings,
    SuseManagerSettings
  }

  alias Trento.Support.DateService

  require Trento.ActivityLog.RetentionPeriodUnit, as: RetentionPeriodUnit
  require Logger

  @type suse_manager_settings_save_submission :: %{
          url: String.t(),
          username: String.t(),
          password: String.t(),
          ca_cert: String.t() | nil
        }

  @type suse_manager_settings_change_submission :: %{
          url: String.t() | nil,
          username: String.t() | nil,
          password: String.t() | nil,
          ca_cert: String.t() | nil
        }

  @type alerting_setting_set_t :: %{
          enabled: boolean,
          sender_email: String.t(),
          recipient_email: String.t(),
          smtp_server: String.t(),
          smtp_port: String.t() | integer,
          smtp_username: String.t(),
          smtp_password: String.t()
        }

  @type alerting_setting_update_t :: %{
          optional(:enabled) => boolean,
          optional(:sender_email) => String.t(),
          optional(:recipient_email) => String.t(),
          optional(:smtp_server) => String.t(),
          optional(:smtp_port) => String.t() | integer,
          optional(:smtp_username) => String.t(),
          optional(:smtp_password) => String.t()
        }

  @alerting_settings_default_env %{
    enabled: false,
    sender: "alerts@trento-project.io",
    recipient: "admin@trento-project.io",
    relay: "",
    port: 587,
    username: "",
    password: ""
  }

  @spec get_installation_id :: String.t()
  def get_installation_id do
    %InstallationSettings{installation_id: installation_id} =
      Repo.one!(InstallationSettings.base_query())

    installation_id
  end

  @spec create_api_key_settings(map()) :: {:ok, ApiKeySettings.t()} | {:error, any}
  def create_api_key_settings(settings) do
    %ApiKeySettings{}
    |> ApiKeySettings.changeset(settings)
    |> Repo.insert()
  end

  @spec get_api_key_settings() :: {:ok, ApiKeySettings.t()} | {:error, any}
  def get_api_key_settings do
    case Repo.one(ApiKeySettings.base_query()) do
      nil -> {:error, :api_key_settings_missing}
      api_key_settings -> {:ok, api_key_settings}
    end
  end

  @spec update_api_key_settings(DateTime.t()) :: {:ok, ApiKeySettings.t()} | {:error, any}
  def update_api_key_settings(expiration) do
    case get_api_key_settings() do
      {:ok, settings} ->
        settings
        |> ApiKeySettings.changeset(%{
          created_at: DateTime.utc_now(),
          expire_at: expiration,
          jti: UUID.uuid4()
        })
        |> Repo.update()

      error ->
        error
    end
  end

  # SUMA settings

  @spec get_suse_manager_settings ::
          {:ok, SuseManagerSettings.t()} | {:error, :settings_not_configured}
  def get_suse_manager_settings do
    settings = Repo.one(SuseManagerSettings.base_query())

    if settings do
      {:ok, settings}
    else
      {:error, :settings_not_configured}
    end
  end

  @spec save_suse_manager_settings(suse_manager_settings_save_submission, module()) ::
          {:ok, SuseManagerSettings.t()}
          | {:error, :settings_already_configured}
          | {:error, any()}
  def save_suse_manager_settings(settings_submission, date_service \\ DateService) do
    with {:ok, :settings_not_configured, settings} <- ensure_no_suse_manager_settings_configured() do
      settings
      |> save_or_update_suse_manager_settings(settings_submission, date_service)
      |> log_error("Error while saving software updates settings")
    end
  end

  @spec change_suse_manager_settings(suse_manager_settings_change_submission, module()) ::
          {:ok, SuseManagerSettings.t()}
          | {:error, :settings_not_configured}
          | {:error, any()}
  def change_suse_manager_settings(settings_submission, date_service \\ DateService) do
    with {:ok, settings} <- get_suse_manager_settings() do
      settings
      |> save_or_update_suse_manager_settings(settings_submission, date_service)
      |> log_error("Error while updating software updates settings")
    end
  end

  @spec clear_suse_manager_settings :: :ok
  def clear_suse_manager_settings do
    Repo.delete_all(SuseManagerSettings.base_query())

    SoftwareUpdatesDiscovery.clear_software_updates_discoveries()

    :ok
  end

  # Activity log settings

  @spec get_activity_log_settings() ::
          {:ok, ActivityLogSettings.t()} | {:error, :activity_log_settings_not_configured}
  def get_activity_log_settings do
    case Repo.one(ActivityLogSettings.base_query()) do
      %ActivityLogSettings{} = settings -> {:ok, settings}
      nil -> {:error, :activity_log_settings_not_configured}
    end
  end

  @spec change_activity_log_retention_period(integer(), RetentionPeriodUnit.t()) ::
          {:ok, ActivityLogSettings.t()}
          | {:error, :activity_log_settings_not_configured}
  def change_activity_log_retention_period(value, unit) do
    case get_activity_log_settings() do
      {:ok, settings} ->
        settings
        |> ActivityLogSettings.changeset(%{
          retention_time: %{
            value: value,
            unit: unit
          }
        })
        |> Repo.update()
        |> log_error("Error while updating activity log retention period")

      error ->
        error
    end
  end

  # Certificates settings

  @spec get_sso_certificates() :: [SSOCertificatesSettings.t()]
  def get_sso_certificates do
    Repo.one(SSOCertificatesSettings.base_query())
  end

  # Alerting Settings

  @spec alerting_settings_enforced_from_env? :: boolean()
  def alerting_settings_enforced_from_env? do
    alerting_raw_app_env()
    |> Enum.map(fn {_key, val} -> val != nil end)
    |> Enum.any?()
  end

  @spec get_alerting_settings ::
          {:ok, AlertingSettings.t()} | {:error, :alerting_settings_not_configured}
  def get_alerting_settings do
    if alerting_settings_enforced_from_env?() do
      get_alerting_settings_from_app_env()
    else
      get_alerting_settings_from_db()
    end
  end

  @spec create_alerting_settings(alerting_setting_set_t()) ::
          {:ok, AlertingSettings.t()}
          | {:error, :alerting_settings_enforced}
          | {:error, Ecto.Changeset.t()}
  def create_alerting_settings(alerting_settings) do
    if alerting_settings_enforced_from_env?() do
      {:error, :alerting_settings_enforced}
    else
      %AlertingSettings{}
      |> AlertingSettings.changeset(alerting_settings)
      |> Repo.insert(returning: true)
    end
  end

  @spec update_alerting_settings(alerting_setting_update_t()) ::
          {:ok, AlertingSettings.t()}
          | {:error, :alerting_settings_enforced}
          | {:error, :alerting_settings_not_configured}
          | {:error, Ecto.Changeset.t()}
  def update_alerting_settings(alerting_settings) do
    if alerting_settings_enforced_from_env?() do
      {:error, :alerting_settings_enforced}
    else
      with {:ok, current_settings} <- get_alerting_settings() do
        current_settings
        |> AlertingSettings.changeset(alerting_settings)
        |> Repo.update()
      end
    end
  end

  @spec alerting_raw_app_env :: Keyword.t()
  defp alerting_raw_app_env do
    Application.get_env(:trento, Trento.Mailer)
    |> Keyword.take([:relay, :port, :username, :password])
    |> Enum.concat(Application.get_env(:trento, :alerting))
  end

  defp get_alerting_settings_from_app_env do
    explicitly_set =
      alerting_raw_app_env()
      |> Enum.filter(fn {_key, value} -> value != nil end)
      |> Map.new()

    %{
      enabled: enabled,
      sender: sender,
      recipient: recipient,
      relay: relay,
      port: port,
      username: username,
      password: password
    } = Map.merge(@alerting_settings_default_env, explicitly_set)

    settings = %Trento.Settings.AlertingSettings{
      enabled: enabled,
      sender_email: sender,
      recipient_email: recipient,
      smtp_server: relay,
      smtp_port: port,
      smtp_username: username,
      smtp_password: password
    }

    {:ok, settings}
  end

  defp get_alerting_settings_from_db do
    case Repo.one(AlertingSettings.base_query()) do
      %AlertingSettings{} = settings -> {:ok, settings}
      nil -> {:error, :alerting_settings_not_configured}
    end
  end

  defp save_or_update_suse_manager_settings(settings, settings_submission, date_service) do
    result =
      case settings do
        nil ->
          %SuseManagerSettings{}
          |> SuseManagerSettings.changeset(settings_submission, date_service)
          |> Repo.insert()

        %SuseManagerSettings{} ->
          settings
          |> SuseManagerSettings.changeset(settings_submission, date_service)
          |> Repo.update()
      end

    case result do
      {:ok, _} = success ->
        SoftwareUpdatesDiscovery.clear()

        Task.Supervisor.start_child(Trento.TasksSupervisor, fn ->
          SoftwareUpdatesDiscovery.discover_software_updates()
        end)

        success

      {:error, _} = error ->
        error
    end
  end

  defp ensure_no_suse_manager_settings_configured do
    case Repo.one(SuseManagerSettings.base_query()) do
      nil ->
        {:ok, :settings_not_configured, nil}

      %SuseManagerSettings{} ->
        Logger.error("Error: software updates settings already configured")
        {:error, :settings_already_configured}
    end
  end

  defp log_error({:error, _} = error, message) do
    Logger.error("#{message}: #{inspect(error)}")
    error
  end

  defp log_error(result, _), do: result
end
