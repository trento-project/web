# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.DiscoveryFixturesHelper do
  @moduledoc """
  This module contains helper functions for loading discovery fixtures.
  """

  @discovery_fixtures_path File.cwd!() <> "/test/fixtures/discovery"

  def load_discovery_event_fixture(name) do
    @discovery_fixtures_path
    |> Path.join("#{name}.json")
    |> File.read!()
    |> Jason.decode!()
  end
end
