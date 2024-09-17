defmodule Trento.Hosts do
  @moduledoc """
  Provides a set of functions to interact with hosts.
  """

  import Ecto.Query

  require Logger

  alias Trento.Repo

  alias Trento.Heartbeats.Heartbeat

  alias Trento.Hosts.Projections.{
    HostReadModel,
    SlesSubscriptionReadModel
  }

  alias Trento.Support.DateService

  alias Trento.Hosts.Commands.{
    RequestHostDeregistration,
    SelectHostChecks
  }

  alias Trento.Infrastructure.Checks

  alias Trento.Repo

  @spec get_all_hosts :: [HostReadModel.t()]
  def get_all_hosts do
    HostReadModel
    |> where([h], not is_nil(h.hostname) and is_nil(h.deregistered_at))
    |> order_by(asc: :hostname)
    |> enrich_host_read_model_query()
    |> Repo.all()
    |> Repo.preload([:sles_subscriptions, :tags])
  end

  @spec by_id(String.t()) :: {:ok, HostReadModel.t()} | {:error, :not_found}
  def by_id(id) do
    case Repo.get(HostReadModel, id) do
      %HostReadModel{} = host -> {:ok, host}
      nil -> {:error, :not_found}
    end
  end

  @spec get_host_by_id(Ecto.UUID.t()) :: HostReadModel.t() | nil
  def get_host_by_id(id) do
    HostReadModel
    |> where([h], h.id == ^id and is_nil(h.deregistered_at))
    |> enrich_host_read_model_query()
    |> Repo.one()
    |> Repo.preload([:sles_subscriptions, :tags])
  end

  @spec get_all_sles_subscriptions :: non_neg_integer()
  def get_all_sles_subscriptions do
    query =
      from s in SlesSubscriptionReadModel,
        where: s.identifier == "SLES_SAP",
        select: count()

    case Repo.one(query) do
      nil ->
        0

      subscription_count ->
        subscription_count
    end
  end

  def request_hosts_checks_execution do
    query =
      from(h in HostReadModel,
        select: h.id,
        where: is_nil(h.deregistered_at)
      )

    query
    |> Repo.all()
    |> Enum.each(fn host_id ->
      case request_checks_execution(host_id) do
        :ok ->
          :ok

        {:error, reason} ->
          Logger.error("Failed to request checks execution, host: #{host_id}, reason: #{reason}")
      end
    end)
  end

  @spec select_checks(String.t(), [String.t()]) :: :ok | {:error, any}
  def select_checks(host_id, checks) do
    Logger.debug("Selecting checks, host: #{host_id}")

    with {:ok, command} <- SelectHostChecks.new(%{host_id: host_id, checks: checks}) do
      commanded().dispatch(command)
    end
  end

  @spec request_checks_execution(String.t()) :: :ok | {:error, any}
  def request_checks_execution(host_id) do
    query =
      from(h in HostReadModel,
        where: is_nil(h.deregistered_at) and h.id == ^host_id
      )

    case Repo.one(query) do
      %HostReadModel{} = host ->
        Logger.debug("Requesting checks execution, host: #{host_id}")

        maybe_request_checks_execution(host)

      nil ->
        Logger.error("Requested checks execution for a non-existing host: #{host_id}")

        {:error, :not_found}
    end
  end

  @spec deregister_host(Ecto.UUID.t(), DateService) ::
          :ok | {:error, :host_alive} | {:error, :host_not_registered}
  def deregister_host(host_id, date_service \\ DateService) do
    commanded().dispatch(
      RequestHostDeregistration.new!(%{host_id: host_id, requested_at: date_service.utc_now()})
    )
  end

  def by_host_id(host_id) do
    case HostReadModel
         |> where([h], h.id == ^host_id and is_nil(h.deregistered_at))
         |> Repo.one() do
      nil -> {:error, :not_found}
      host -> {:ok, host}
    end
  end

  @spec enrich_host_read_model_query(Ecto.Query.t()) :: Ecto.Query.t()
  defp enrich_host_read_model_query(query) do
    query
    |> join(:left, [h], hb in Heartbeat, on: type(h.id, :string) == hb.agent_id)
    |> select_merge([h, hb], %{last_heartbeat_timestamp: hb.timestamp})
  end

  defp maybe_request_checks_execution(%{selected_checks: []}), do: {:error, :no_checks_selected}

  defp maybe_request_checks_execution(%{
         id: host_id,
         selected_checks: selected_checks,
         provider: provider
       }) do
    Checks.request_execution(
      UUID.uuid4(),
      host_id,
      %Checks.HostExecutionEnv{provider: provider},
      [%{host_id: host_id}],
      selected_checks,
      :host
    )
  end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end
