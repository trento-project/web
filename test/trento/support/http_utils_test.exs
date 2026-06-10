# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Support.HttpUtilsTest do
  @moduledoc false

  use ExUnit.Case, async: true

  alias Trento.Support.HttpUtils

  describe "resolve_url/3" do
    test "uses absolute http base_url verbatim, ignoring origin" do
      assert HttpUtils.resolve_url("http://wanda", "/api", "https://trento.example.com") ==
               "http://wanda/api"
    end

    test "uses absolute https base_url verbatim, ignoring origin" do
      assert HttpUtils.resolve_url(
               "https://wanda.example.com",
               "/api",
               "https://trento.example.com"
             ) ==
               "https://wanda.example.com/api"
    end

    test "prepends origin when base_url is relative" do
      assert HttpUtils.resolve_url("/checks", "/api", "https://trento.example.com") ==
               "https://trento.example.com/checks/api"
    end

    test "prepends origin when base_url is empty" do
      assert HttpUtils.resolve_url("", "/api", "https://trento.example.com") ==
               "https://trento.example.com/api"
    end

    test "falls back to base_url + path when base_url is relative and origin is nil" do
      assert HttpUtils.resolve_url("/checks", "/api", nil) == "/checks/api"
    end

    test "falls back to base_url + path when base_url is relative and origin is empty" do
      assert HttpUtils.resolve_url("/checks", "/api", "") == "/checks/api"
    end

    test "returns just path when base_url is empty and origin is missing" do
      assert HttpUtils.resolve_url("", "/api", nil) == "/api"
    end
  end
end
