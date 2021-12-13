defmodule Tronto.Monitoring.Heartbeats do
  @moduledoc """
  Heartbeat related functions
  """

  alias Tronto.Monitoring.Heartbeat
  alias Tronto.Repo

  alias Ecto.Multi

  import Ecto.Query, only: [from: 2]

  require Logger

  @heartbeat_interval Application.compile_env!(:tronto, __MODULE__)[:interval]

  @spec heartbeat(any) :: :ok | {:error, :heartbeat_insert_failed}
  def heartbeat(agent_id) do
    case %Heartbeat{}
         |> Heartbeat.changeset(%{
           agent_id: agent_id,
           timestamp: DateTime.utc_now()
         })
         |> Repo.insert(
           conflict_target: :agent_id,
           on_conflict: {:replace, [:timestamp]}
         ) do
      {:ok, _} ->
        :ok

      {:error, reasons} ->
        Logger.error("Error while storing heartbeat for agent #{agent_id}",
          error: inspect(reasons)
        )

        {:error, :heartbeat_insert_failed}
    end
  end

  def dispatch_heartbeat_failed_commands() do
    get_all_expired_heartbeats()
    |> Enum.each(fn heartbeat ->
      Multi.new()
      |> Multi.delete(:delete, heartbeat)
      |> Multi.run(:command, fn _, %{delete: %{agent_id: agent_id}} ->
        dispatch_command(agent_id)
      end)
      |> Repo.transaction()
    end)
  end

  defp get_all_expired_heartbeats() do
    query =
      from h in Heartbeat,
        where: h.timestamp < ^DateTime.add(DateTime.utc_now(), @heartbeat_interval, :millisecond)

    Repo.all(query)
  end

  defp dispatch_command(agent_id) do
    Logger.info("Heartbeat expired for agents: #{inspect(agent_id)}")
    {:ok, :done}
  end
end
