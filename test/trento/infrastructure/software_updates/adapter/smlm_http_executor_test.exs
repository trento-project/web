# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.SoftwareUpdates.Adapter.SmlmHttpExecutorTest do
  use ExUnit.Case

  import Mox

  alias Trento.Infrastructure.SoftwareUpdates.Smlm.HttpExecutor
  alias Trento.Support.HttpClient.Mock

  @base_url "https://smlm.example.com/rhn/manager/api"
  @auth "pxt-session-cookie=abc"
  @ca_fixtures [
    {"one_entry_chain.pem", 1},
    {"two_entries_chain.pem", 2},
    {"three_entries_chain.pem", 3}
  ]

  setup :verify_on_exit!

  def load_certificate_content(name) do
    File.cwd!()
    |> Path.join("/test/fixtures/cert")
    |> Path.join(name)
    |> File.read!()
  end

  describe "Http executor certificate handling" do
    test "should support chained certificates" do
      scenarios = [
        %{cert: "one_entry_chain.pem", expected_entries: 1},
        %{cert: "two_entries_chain.pem", expected_entries: 2},
        %{cert: "three_entries_chain.pem", expected_entries: 3}
      ]

      for %{cert: cert, expected_entries: expected_entries} <- scenarios do
        assert cert
               |> load_certificate_content()
               |> HttpExecutor.get_cert_der()
               |> length() == expected_entries
      end
    end
  end

  describe "requests go through Trento.Support.HttpClient" do
    setup do
      default_config = Application.get_env(:trento, HttpExecutor, [])
      Application.put_env(:trento, HttpExecutor, Keyword.put(default_config, :http_client, Mock))
      on_exit(fn -> Application.put_env(:trento, HttpExecutor, default_config) end)
    end

    test "login posts the credentials and trusts only the configured CA" do
      for {fixture, entries} <- @ca_fixtures do
        ca_cert = load_certificate_content(fixture)
        cacerts = HttpExecutor.get_cert_der(ca_cert)
        assert length(cacerts) == entries

        expect(Mock, :request, fn :post, url, body, _headers, options ->
          assert url == "#{@base_url}/auth/login"
          assert Jason.decode!(body) == %{"login" => "admin", "password" => "secret"}
          assert options[:ssl] == [verify: :verify_peer, cacerts: cacerts]
          {:ok, %HTTPoison.Response{status_code: 200}}
        end)

        assert {:ok, %HTTPoison.Response{status_code: 200}} =
                 HttpExecutor.login(@base_url, "admin", "secret", ca_cert)
      end
    end

    test "without a CA, HttpClient's TLS defaults apply" do
      expect(Mock, :request, fn :post, _url, _body, _headers, options ->
        refute Keyword.has_key?(options, :ssl)
        {:ok, %HTTPoison.Response{status_code: 200}}
      end)

      assert {:ok, _} = HttpExecutor.login(@base_url, "admin", "secret", nil)
    end

    test "API calls send the session cookie, their parameters and the configured CA" do
      advisory = "SUSE-SU-2024:1234-1"

      scenarios = [
        {&HttpExecutor.get_system_id/4, "host.example.com", :get, "/system/getId",
         %{name: "host.example.com"}},
        {&HttpExecutor.get_relevant_patches/4, 42, :get, "/system/getRelevantErrata", %{sid: 42}},
        {&HttpExecutor.get_upgradable_packages/4, 42, :get,
         "/system/listLatestUpgradablePackages", %{sid: 42}},
        {&HttpExecutor.get_errata_details/4, advisory, :get, "/errata/getDetails",
         %{"advisoryName" => advisory}},
        {&HttpExecutor.get_affected_systems/4, advisory, :get, "/errata/listAffectedSystems",
         %{"advisoryName" => advisory}},
        {&HttpExecutor.get_cves/4, advisory, :get, "/errata/listCves",
         %{"advisoryName" => advisory}},
        {&HttpExecutor.get_affected_packages/4, advisory, :get, "/errata/listPackages",
         %{"advisoryName" => advisory}},
        {&HttpExecutor.get_patches_for_package/4, "123", :get, "/packages/listProvidingErrata",
         %{pid: 123}},
        {&HttpExecutor.get_bugzilla_fixes/4, advisory, :post, "/errata/bugzillaFixes",
         %{"advisoryName" => advisory}}
      ]

      for {fixture, entries} <- @ca_fixtures,
          {call, arg, verb, path, params} <- scenarios do
        ca_cert = load_certificate_content(fixture)
        cacerts = HttpExecutor.get_cert_der(ca_cert)
        assert length(cacerts) == entries

        expect(Mock, :request, fn ^verb, url, "", _headers, options ->
          assert url == @base_url <> path
          assert options[:params] == params
          assert options[:hackney] == [cookie: [@auth]]
          assert options[:ssl] == [verify: :verify_peer, cacerts: cacerts]
          {:ok, %HTTPoison.Response{status_code: 200}}
        end)

        assert {:ok, _} = call.(@base_url, @auth, arg, ca_cert)
      end
    end
  end
end
