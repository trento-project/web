# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.ComponentVersionsTest do
  @moduledoc false

  use ExUnit.Case, async: false

  alias Trento.Infrastructure.ComponentVersions

  describe "resolve_checks_url/2" do
    setup do
      original = Application.get_env(:trento, :checks_service)

      on_exit(fn ->
        if is_nil(original) do
          Application.delete_env(:trento, :checks_service)
        else
          Application.put_env(:trento, :checks_service, original)
        end
      end)

      :ok
    end

    test "leaves the base url untouched when it is absolute, ignoring the origin" do
      Application.put_env(:trento, :checks_service, base_url: "https://wanda.example.com")

      assert ComponentVersions.resolve_checks_url("/api", "https://trento.example.com") ==
               "https://wanda.example.com/api"
    end

    test "prepends the origin when the base url is relative" do
      Application.put_env(:trento, :checks_service, base_url: "/checks")

      assert ComponentVersions.resolve_checks_url("/api", "https://trento.example.com") ==
               "https://trento.example.com/checks/api"
    end
  end
end
