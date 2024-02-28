defmodule Trento.Settings do
  @moduledoc """
  Provides a set of functions of settings related usecases.
  """

  import Ecto.Query

  alias Trento.Repo

  alias Trento.Hosts.Projections.SlesSubscriptionReadModel

  alias Trento.Settings.{
    ApiKeySettings,
    InstallationSettings
  }

  require Logger

  @sles_identifier "SLES_SAP"

  @spec get_installation_id :: String.t()
  def get_installation_id do
    %InstallationSettings{installation_id: installation_id} =
      Repo.one!(InstallationSettings.base_query())

    installation_id
  end

  @spec eula_accepted? :: boolean
  def eula_accepted? do
    %InstallationSettings{eula_accepted: eula_accepted} =
      Repo.one!(InstallationSettings.base_query())

    eula_accepted
  end

  def accept_eula do
    {1, _} = Repo.update_all(InstallationSettings.base_query(), set: [eula_accepted: true])
    :ok
  end

  def premium? do
    flavor() == "Premium"
  end

  @spec premium_active? :: boolean
  def premium_active? do
    flavor() == "Premium" && has_premium_subscription?()
  end

  @spec has_premium_subscription? :: boolean
  def has_premium_subscription? do
    query =
      from(s in SlesSubscriptionReadModel,
        where: s.identifier == @sles_identifier
      )

    Repo.exists?(query)
  end

  @spec flavor :: String.t()
  def flavor, do: Application.get_env(:trento, :flavor)

  @spec create_api_key_settings(map()) :: {:ok, ApiKeySettings.t()} | {:error, any}
  def create_api_key_settings(settings) do
    %ApiKeySettings{}
    |> ApiKeySettings.changeset(settings)
    |> Repo.insert()
  end

  @spec get_api_key_settings() :: {:ok, ApiKeySettings.t()} | {:error, any}
  def get_api_key_settings() do
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
          api_key_created_at: DateTime.utc_now(),
          api_key_expire_at: expiration,
          jti: UUID.uuid4()
        })
        |> Repo.update()

      error ->
        error
    end
  end
end
