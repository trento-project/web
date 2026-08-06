# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.ConfigTest do
  @moduledoc false

  use ExUnit.Case, async: true

  alias Trento.Config

  describe "parse_log_level/1" do
    for level <- Logger.levels() do
      @level level

      test "should parse the #{level} level" do
        assert {:ok, @level} == Config.parse_log_level(Atom.to_string(@level))
      end
    end

    scenarios = [
      %{name: "unknown level", value: "verbose"},
      %{name: "existing atom which is not a level", value: "trento"},
      %{name: "empty string", value: ""},
      %{name: "nil", value: nil},
      %{name: "atom", value: :info},
      %{name: "integer", value: 1}
    ]

    for %{name: name} = scenario <- scenarios do
      @scenario scenario

      test "should not parse an invalid level - #{name}" do
        %{value: value} = @scenario

        assert {:error, :invalid_level} == Config.parse_log_level(value)
      end
    end
  end
end
