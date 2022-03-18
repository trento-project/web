defmodule Trento.Heartbeats do
  @moduledoc """
  Heartbeat related functions
  """

  alias Trento.Domain.Commands.UpdateHeartbeat
  alias Trento.Heartbeat

  alias Trento.Repo

  alias Ecto.Multi

  import Ecto.Query, only: [from: 2]

  require Logger

  @heartbeat_interval Application.compile_env!(:trento, __MODULE__)[:interval]

  def heartbeat(agent_id) do
    heartbeat = Repo.get(Heartbeat, agent_id)

    changeset =
      Heartbeat.changeset(
        %Heartbeat{},
        %{
          agent_id: agent_id,
          timestamp: DateTime.utc_now()
        }
      )

    Multi.new()
    |> Multi.insert(:insert, changeset,
      conflict_target: :agent_id,
      on_conflict: {:replace, [:timestamp]}
    )
    |> Multi.run(:command, fn _, _ ->
      case heartbeat do
        nil ->
          dispatch_command(agent_id, :passing)

        %Heartbeat{} ->
          {:ok, :noop}
      end
    end)
    |> Repo.transaction()
  end

  @spec dispatch_heartbeat_failed_commands :: :ok
  def dispatch_heartbeat_failed_commands do
    get_all_expired_heartbeats()
    |> Enum.each(fn heartbeat ->
      Multi.new()
      |> Multi.delete(:delete, heartbeat)
      |> Multi.run(:command, fn _, %{delete: %Heartbeat{agent_id: agent_id}} ->
        dispatch_command(agent_id, :critical)
      end)
      |> Repo.transaction()
    end)
  end

  defp get_all_expired_heartbeats do
    query =
      from h in Heartbeat,
        where: h.timestamp < ^DateTime.add(DateTime.utc_now(), -@heartbeat_interval, :millisecond)

    Repo.all(query)
  end

  @spec dispatch_command(any(), :passing | :critical) :: {:ok, :done}
  defp dispatch_command(agent_id, heartbeat) do
    case %{host_id: agent_id, heartbeat: heartbeat}
         |> UpdateHeartbeat.new!()
         |> Trento.Commanded.dispatch() do
      :ok ->
        {:ok, :done}

      {:error, _} = error ->
        error
    end
  end
end
