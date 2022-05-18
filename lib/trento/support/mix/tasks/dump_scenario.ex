defmodule Mix.Tasks.DumpScenario do
  @moduledoc "The hello mix task: `mix help hello`"

  use Mix.Task
  import Trento.Tasks.Helper

  alias Trento.Integration.Discovery

  alias Trento.Integration.Discovery.{
    DiscardedEvent,
    DiscoveryEvent
  }

  @switches [
    path: :string,
    discarded_event_number: :integer
  ]

  @aliases [
    p: :path,
    d: :discarded_event_number
  ]

  @default_path File.cwd!()
  @default_discarded_event_number 10
  @discarded_events_file "discarded_events.txt"

  @shortdoc "Dump the current discovery scenario and discarded events."
  def run(args) do
    case OptionParser.parse(args, switches: @switches, aliases: @aliases) do
      {opts, [scenario_name], _} ->
        case start_repo() do
          {:ok, _} ->
            IO.puts(IO.ANSI.green() <> "Dumping scenario #{scenario_name}...")
            path = Keyword.get(opts, :path, @default_path)

            discarded_event_number =
              Keyword.get(opts, :discarded_event_number, @default_discarded_event_number)

            dump_scenario(scenario_name, path)
            dump_discarded_events(scenario_name, path, discarded_event_number)
            IO.puts(IO.ANSI.green() <> "Done.")

          {:error, error} ->
            print_error("Could not start repo: #{error}")
        end

      {_, _, _} ->
        print_error(
          "Expected dump_scenario to receive the scenario file name, " <>
            "got: #{inspect(Enum.join(args, " "))}"
        )
    end
  end

  defp dump_scenario(scenario_name, path) do
    Discovery.get_current_discovery_events()
    |> Enum.map(fn %DiscoveryEvent{
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
    end)
  end

  defp dump_discarded_events(scenario_name, path, event_number) do
    scenario_path = Path.join(path, scenario_name)
    File.mkdir_p!(scenario_path)
    discarded_events_file = Path.join(scenario_path, @discarded_events_file)
    File.rm(discarded_events_file)

    Discovery.get_discarded_events(event_number)
    |> Enum.map(fn %DiscardedEvent{
                     id: id,
                     payload: payload,
                     reason: reason
                   } ->
      data = Jason.encode!(payload)

      discarded_events_file
      |> File.write!(
        "Discarded event: #{id}\n\nReason:\n\n#{reason}\n\nPayload:\n\n#{data}\n\n",
        [:append]
      )
    end)
  end
end
