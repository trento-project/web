defmodule Trento.Integration.Checks.MockRunner do
  @moduledoc """
  Mocks a checks runner.
  """

  @behaviour Trento.Integration.Checks.Gen

  use GenServer

  require Logger

  alias Trento.Integration.Checks.Models.FlatCatalog

  @json_path Path.join(File.cwd!(), "priv/data/catalog.json")
  @catalog @json_path |> File.read!() |> Jason.decode!()
  @external_resource @json_path

  defstruct [:expected_results]

  @type t :: %__MODULE__{
          expected_results: :passing | :warning | :critical | :random
        }

  def start_link(_opts) do
    GenServer.start_link(
      __MODULE__,
      %__MODULE__{
        expected_results: :random
      },
      name: __MODULE__
    )
  end

  @impl true
  def init(state), do: {:ok, state}

  @impl true
  def handle_cast(
        {:request_execution, execution_id, cluster_id, hosts, checks},
        %__MODULE__{
          expected_results: expected_results
        }
      ) do
    :ok = send_execution_started_event(execution_id, cluster_id)
    # simulate a real execution by sleeping for a while
    2000..4000 |> Enum.random() |> Process.sleep()

    :ok =
      send_execution_completed_event(
        execution_id,
        cluster_id,
        hosts,
        checks,
        expected_results
      )

    {:noreply,
     %__MODULE__{
       expected_results: :random
     }}
  end

  def handle_cast({:set_expected_results, expected_results}, state) do
    {:noreply, %__MODULE__{state | expected_results: expected_results}}
  end

  @impl true
  def request_execution(execution_id, cluster_id, hosts, checks) do
    GenServer.cast(
      __MODULE__,
      {:request_execution, execution_id, cluster_id, hosts, checks}
    )
  end

  @impl true
  def get_catalog do
    FlatCatalog.new(%{checks: @catalog})
  end

  @doc """
  Set the expected results for the next execution.
  """
  @spec set_expected_results(:passing | :warning | :critical | :random) :: :ok
  def set_expected_results(expected_results) do
    GenServer.cast(__MODULE__, {:set_expected_results, expected_results})
  end

  defp send_execution_started_event(execution_id, cluster_id) do
    HTTPoison.post!(
      "http://localhost:4000/api/runner/callback",
      Jason.encode!(%{
        "event" => "execution_started",
        "cluster_id" => cluster_id,
        "execution_id" => execution_id
      }),
      [{"Content-type", "application/json"}]
    )

    Logger.debug("started #{execution_id}")
  end

  defp send_execution_completed_event(
         execution_id,
         cluster_id,
         hosts,
         checks,
         expected_results
       ) do
    HTTPoison.post!(
      "http://localhost:4000/api/runner/callback",
      Jason.encode!(%{
        "event" => "execution_completed",
        "execution_id" => execution_id,
        "payload" => %{
          "cluster_id" => cluster_id,
          "hosts" =>
            Enum.map(hosts, fn host_id ->
              %{
                "host_id" => host_id,
                "reachable" => true,
                "msg" => "Some message",
                "results" =>
                  Enum.map(checks, fn check_id ->
                    %{
                      "check_id" => check_id,
                      "result" => generate_result(expected_results)
                    }
                  end)
              }
            end)
        }
      }),
      [{"Content-type", "application/json"}]
    )

    # TODO: post event to callback
    Logger.debug("results #{execution_id} #{cluster_id} #{hosts} #{checks} #{expected_results}")
  end

  defp generate_result(:random), do: Enum.random([:passing, :warning, :critical])
  defp generate_result(expected_result), do: expected_result
end
