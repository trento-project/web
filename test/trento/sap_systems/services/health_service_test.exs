# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Services.HealthServiceTest do
  @moduledoc false

  use ExUnit.Case

  alias Trento.SapSystems.Services.HealthService
  require Trento.Enums.Health, as: Health
  require Trento.SapSystems.Enums.Status, as: Status

  describe "SAP Systems health service" do
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

    test "should upcast health to status for legacy handling purposes" do
      for [health, status] <- [
            ["passing", Status.green()],
            ["warning", Status.yellow()],
            ["critical", Status.red()],
            ["unknown", Status.gray()]
          ] do
        assert %{"status" => status} ==
                 HealthService.upcast_health_to_status(%{"health" => health})
      end
    end

    test "should add deprecated health field" do
      for [status, health] <- [
            [Status.green(), Health.passing()],
            [Status.yellow(), Health.warning()],
            [Status.red(), Health.critical()],
            [Status.gray(), Health.unknown()]
          ] do
        assert %{health: health, status: status} ==
                 HealthService.add_deprecated_health(%{status: status})
      end
    end
  end
end
