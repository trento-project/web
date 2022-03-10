defmodule Tronto.Monitoring.Domain.HealthService do
  @moduledoc """
  This module contains the domain logic for everything health related.
  """

  alias Tronto.Monitoring.Domain.Health

  @spec compute_aggregated_health([Health.t() | String.t()]) :: Health.t()
  def compute_aggregated_health([]), do: :unknown

  def compute_aggregated_health(healths) do
    healths
    # FIXME: this will be removed once we have event casting to structs in place
    |> Enum.map(fn
      health when is_binary(health) ->
        String.to_existing_atom(health)

      health ->
        health
    end)
    |> Enum.map(&{&1, health_weight(&1)})
    |> Enum.max_by(fn {_, weight} -> weight end)
    |> elem(0)
  end

  defp health_weight(:unknown), do: 3
  defp health_weight(:critical), do: 2
  defp health_weight(:warning), do: 1
  defp health_weight(:passing), do: 0
end
