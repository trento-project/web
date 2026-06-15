# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Databases.Events.Upcaster.UpcastHelperTest do
  @moduledoc false

  use ExUnit.Case

  require Trento.SapSystems.Enums.Status, as: Status

  alias Trento.Databases.Events.Upcaster.UpcastHelper

  describe "Upcast helper" do
    test "should upcast health to status for legacy handling purposes" do
      for [health, status] <- [
            ["passing", Status.green()],
            ["warning", Status.yellow()],
            ["critical", Status.red()],
            ["unknown", Status.gray()]
          ] do
        assert %{"status" => status} ==
                 UpcastHelper.upcast_health_to_status(%{"health" => health})
      end
    end
  end
end
