# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Support.HttpUtilsTest do
  @moduledoc false

  use ExUnit.Case, async: true

  alias Trento.Support.HttpUtils

  describe "request_origin/1" do
    scenarios = [
      %{
        name: "URI with default HTTP port",
        source: %URI{scheme: "http", host: "trento.example.com", port: 80},
        expected: "http://trento.example.com"
      },
      %{
        name: "URI with default HTTPS port",
        source: %URI{scheme: "https", host: "trento.example.com", port: 443},
        expected: "https://trento.example.com"
      },
      %{
        name: "URI with non-default HTTP port",
        source: %URI{scheme: "http", host: "trento.example.com", port: 8080},
        expected: "http://trento.example.com:8080"
      },
      %{
        name: "URI with non-default HTTPS port",
        source: %URI{scheme: "https", host: "trento.example.com", port: 4443},
        expected: "https://trento.example.com:4443"
      },
      %{
        name: "Plug.Conn with default HTTP port",
        source: %Plug.Conn{scheme: :http, host: "trento.example.com", port: 80},
        expected: "http://trento.example.com"
      },
      %{
        name: "Plug.Conn with default HTTPS port",
        source: %Plug.Conn{scheme: :https, host: "trento.example.com", port: 443},
        expected: "https://trento.example.com"
      },
      %{
        name: "Plug.Conn with non-default HTTPS port",
        source: %Plug.Conn{scheme: :https, host: "trento.example.com", port: 4443},
        expected: "https://trento.example.com:4443"
      },
      %{
        source: nil,
        expected: nil
      },
      %{
        name: "Raw map with matching keys",
        source: %{scheme: :http, host: "x", port: 80},
        expected: nil
      },
      %{
        name: "String input",
        source: "http://trento.example.com",
        expected: nil
      }
    ]

    for %{name: name} = scenario <- scenarios do
      @scenario scenario

      test "should detect expected request origin - #{name}" do
        %{source: source, expected: expected} = @scenario
        assert HttpUtils.request_origin(source) == expected
      end
    end
  end

  describe "resolve_url/3" do
    scenarios = [
      %{
        name: "uses absolute http base_url verbatim, ignoring origin",
        base_url: "http://wanda",
        path: "/api",
        origin: "https://trento.example.com",
        expected: "http://wanda/api"
      },
      %{
        name: "uses absolute https base_url verbatim, ignoring origin",
        base_url: "https://wanda.example.com",
        path: "/api",
        origin: "https://trento.example.com",
        expected: "https://wanda.example.com/api"
      },
      %{
        name: "prepends origin when base_url is relative",
        base_url: "/checks",
        path: "/api",
        origin: "https://trento.example.com",
        expected: "https://trento.example.com/checks/api"
      },
      %{
        name: "prepends origin when base_url is empty",
        base_url: "",
        path: "/api",
        origin: "https://trento.example.com",
        expected: "https://trento.example.com/api"
      },
      %{
        name: "falls back to base_url + path when base_url is relative and origin is nil",
        base_url: "/checks",
        path: "/api",
        origin: nil,
        expected: "/checks/api"
      },
      %{
        name: "falls back to base_url + path when base_url is relative and origin is empty",
        base_url: "/checks",
        path: "/api",
        origin: "",
        expected: "/checks/api"
      },
      %{
        name: "returns just path when base_url is empty and origin is missing",
        base_url: "",
        path: "/api",
        origin: nil,
        expected: "/api"
      }
    ]

    for %{name: name} = scenario <- scenarios do
      @scenario scenario

      test "should resolve URL correctly - #{name}" do
        %{base_url: base_url, path: path, origin: origin, expected: expected} = @scenario
        assert HttpUtils.resolve_url(base_url, path, origin) == expected
      end
    end
  end
end
