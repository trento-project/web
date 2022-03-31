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

  def start_link do
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
        {:request_execution, execution_id, cluster_id, hosts, selected_checks},
        %__MODULE__{
          expected_results: expected_results
        }
      ) do
    :ok = send_execution_started_event(execution_id)
    # simulate a real execution by sleeping for a while
    2000..4000 |> Enum.random() |> Process.sleep()

    :ok =
      send_check_results_event(execution_id, cluster_id, hosts, selected_checks, expected_results)

    {:noreply,
     %__MODULE__{
       expected_results: :random
     }}
  end

  def handle_cast({:set_expected_results, expected_results}, state) do
    {:noreply, %__MODULE__{state | expected_results: expected_results}}
  end

  @impl true
  def request_execution(execution_id, cluster_id, hosts, selected_checks) do
    GenServer.cast(
      __MODULE__,
      {:request_execution, execution_id, cluster_id, hosts, selected_checks}
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

  defp send_execution_started_event(execution_id) do
    # TODO: post event to callback
    Logger.debug("started #{execution_id}")
  end

  defp send_check_results_event(
         execution_id,
         cluster_id,
         hosts,
         selected_checks,
         expected_results
       ) do
    # TODO: post event to callback
    Logger.debug(
      "results #{execution_id} #{cluster_id} #{hosts} #{selected_checks} #{expected_results}"
    )
  end
end
