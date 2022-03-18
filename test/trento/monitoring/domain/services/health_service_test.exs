defmodule Trento.Monitoring.Domain.HealthServiceTest do
  use ExUnit.Case

  alias Trento.Monitoring.Domain.HealthService

  @test_cases [
    {[:passing, :warning, :critical], :critical},
    {[:passing, :warning, :passing], :warning},
    {[:passing, :passing, :passing], :passing},
    {[:passing, :passing, :critical, :unknown], :unknown}
  ]

  for {healths, expected_aggregated_health} <- @test_cases do
    test "should aggregate healths to #{expected_aggregated_health}" do
      assert unquote(expected_aggregated_health) ==
               HealthService.compute_aggregated_health(unquote(healths))
    end
  end
end
