defmodule Trento.Heartbeats do
  @moduledoc """
  Heartbeat related functions
  """

  alias Trento.Hosts.Commands.UpdateHeartbeat

  alias Trento.Heartbeats.Heartbeat
  alias Trento.Hosts.Projections.HostReadModel

  alias Trento.Support.DateService

  alias Trento.Repo

  alias Ecto.Multi

  import Ecto.Query, only: [from: 2]

  require Logger

  @heartbeat_interval Application.compile_env!(:trento, __MODULE__)[:interval]

  @spec heartbeat(String.t(), module()) :: :ok | {:error, any}
  def heartbeat(agent_id, date_service \\ DateService) do
    changeset =
      Heartbeat.changeset(
        %Heartbeat{},
        %{
          agent_id: agent_id,
          timestamp: date_service.utc_now()
        }
      )

    result =
      Multi.new()
      |> Multi.insert(:insert, changeset,
        conflict_target: :agent_id,
        on_conflict: {:replace, [:timestamp]}
      )
      |> Multi.run(:command, fn _, _ ->
        dispatch_command(agent_id, :passing)
      end)
      |> Repo.transaction()

    case result do
      {:ok, _} ->
        :ok

      {:error, :command, :host_not_registered, _} ->
        {:error, :not_found}

      {:error, reason} = error ->
        Logger.error(
          "Error while updating heartbeat for agent #{agent_id}, error: #{inspect(reason)}"
        )

        error
    end
  end

  @spec dispatch_heartbeat_failed_commands(module()) :: :ok
  def dispatch_heartbeat_failed_commands(date_service \\ DateService) do
    Enum.each(get_all_expired_heartbeats(date_service), fn %{agent_id: agent_id} ->
      dispatch_command(agent_id, :critical)
    end)
  end

  defp get_all_expired_heartbeats(date_service) do
    query =
      from h in Heartbeat,
        join: host in HostReadModel,
        on: h.agent_id == type(host.id, :string),
        where:
          is_nil(host.deregistered_at) and
            h.timestamp <
              ^DateTime.add(date_service.utc_now(), -@heartbeat_interval, :millisecond)

    Repo.all(query)
  end

  @spec dispatch_command(any(), :passing | :critical) :: {:ok, :done} | {:error, :any}
  defp dispatch_command(agent_id, heartbeat) do
    case %{host_id: agent_id, heartbeat: heartbeat}
         |> UpdateHeartbeat.new!()
         |> commanded().dispatch() do
      :ok ->
        {:ok, :done}

      {:error, _} = error ->
        error
    end
  end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end
