# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Services.HealthServiceTest do
  use ExUnit.Case

  alias Trento.Services.HealthService
  require Trento.Enums.Health, as: Health
  require Trento.SapSystems.Enums.Status, as: Status

  @test_cases [
    {[:passing, :warning, :critical], :critical},
    {[:passing, :warning, :passing], :warning},
    {[:passing, :passing, :passing], :passing},
    {[:passing, :passing, :critical, :unknown], :unknown}
  ]

  describe "Health service aggregation" do
    for {healths, expected_aggregated_health} <- @test_cases do
      test "should aggregate healths #{inspect(healths)} to #{expected_aggregated_health}" do
        assert unquote(expected_aggregated_health) ==
                 HealthService.compute_aggregated_health(unquote(healths))
      end
    end
  end

  describe "Health service instance conversions and health computation" do
    test "should derive health from status" do
      for [status, health] <- [
            [Status.green(), Health.passing()],
            [Status.yellow(), Health.warning()],
            [Status.red(), Health.critical()],
            [Status.gray(), Health.unknown()]
          ] do
        assert health == HealthService.derive_health_from_status(status)
      end
    end

    test "should compute instances health" do
      assert Health.unknown() == HealthService.compute_instances_health([])

      assert Health.passing() ==
               HealthService.compute_instances_health([%{status: Status.green()}])

      assert Health.warning() ==
               HealthService.compute_instances_health([
                 %{status: Status.green()},
                 %{status: Status.yellow()}
               ])

      assert Health.critical() ==
               HealthService.compute_instances_health([
                 %{status: Status.green()},
                 %{status: Status.red()}
               ])

      assert Health.unknown() ==
               HealthService.compute_instances_health([
                 %{status: Status.green()},
                 %{status: Status.gray()}
               ])
    end
  end
end
