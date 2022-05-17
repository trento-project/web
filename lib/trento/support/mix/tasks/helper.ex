defmodule Trento.Tasks.Helper do
  @moduledoc """
  Helper functions for tasks.
  """

  alias Trento.Integration.Discovery.DiscoveryEvent

  def start_repo do
    [:postgrex, :ecto]
    |> Enum.each(&Application.ensure_all_started/1)

    Trento.Repo.start_link()
  end

  def print_error(msg) do
    case Code.ensure_compiled(Mix) do
      {:module, _} -> Mix.raise(msg)
      {:error, _} -> IO.puts(IO.ANSI.red() <> msg)
    end
  end

  def write_events_to_files(events, scenario_name, path) do
    Enum.map(
      events,
      fn %DiscoveryEvent{
           agent_id: agent_id,
           discovery_type: discovery_type,
           payload: payload
         } ->
        data =
          Jason.encode!(%{
            agent_id: agent_id,
            discovery_type: discovery_type,
            payload: payload
          })

        scenario_path = Path.join(path, scenario_name)
        File.mkdir_p!(scenario_path)

        scenario_path
        |> Path.join("#{agent_id}_#{discovery_type}.json")
        |> File.write!(data)
      end
    )
  end
end
