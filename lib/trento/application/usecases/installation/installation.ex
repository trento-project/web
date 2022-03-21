defmodule Trento.Installation do
  import Ecto.Query

  alias Trento.Repo

  alias Trento.Settings
  alias Trento.SlesSubscriptionReadModel

  require Logger

  @sles_identifier "SLES_SAP"

  @spec get_installation_id :: String.t()
  def get_installation_id do
    %Settings{installation_id: installation_id} = Repo.one!(Settings)

    installation_id
  end

  @spec eula_accepted? :: boolean
  def eula_accepted? do
    %Settings{eula_accepted: eula_accepted} = Repo.one!(Settings)

    eula_accepted
  end

  def accept_eula do
    {1, _} = Repo.update_all(Settings, set: [eula_accepted: true])
    :ok
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
  defp flavor, do: Application.get_env(:trento, :flavor)
end
