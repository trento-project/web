defmodule Trento.Infrastructure.SoftwareUpdates.SumaTest do
  use Trento.DataCase

  import Mox

  import Trento.Factory

  alias Trento.Infrastructure.SoftwareUpdates.Suma
  alias Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor.Mock, as: SumaApiMock
  alias Trento.Infrastructure.SoftwareUpdates.Suma.State
  alias Trento.SoftwareUpdates.Settings

  setup [:set_mox_from_context, :verify_on_exit!]

  @test_integration_name "test_integration"

  setup do
    {:ok, %{settings: insert_software_updates_settings()}}
  end

  describe "Process start up and identification" do
    test "should find an already started SUMA process" do
      assert {_, {:already_started, pid}} = start_supervised(Suma)

      assert pid == Suma.identify()
    end

    test "should start a new identifiable process" do
      assert {:ok, pid} = start_supervised({Suma, @test_integration_name})

      assert pid == Suma.identify(@test_integration_name)
    end

    test "should have expected initial state" do
      {_, {:already_started, _}} = start_supervised(Suma)
      {:ok, _} = start_supervised({Suma, @test_integration_name})

      expected_state = %State{
        url: nil,
        username: nil,
        password: nil,
        ca_cert: nil,
        auth: nil
      }

      assert :sys.get_state(Suma.identify()) == expected_state
      assert :sys.get_state(Suma.identify(@test_integration_name)) == expected_state
    end

    test "should redact sensitive data in SUMA state", %{
      settings: %Settings{url: url, username: username, password: password}
    } do
      {:ok, _} = start_supervised({Suma, @test_integration_name})

      base_api_url = "#{url}/rhn/manager/api"

      expect(SumaApiMock, :login, fn ^base_api_url, ^username, ^password ->
        successful_login_response()
      end)

      assert :ok = Suma.setup(@test_integration_name)

      expected = %{
        url: url,
        username: username,
        password: "<REDACTED>",
        ca_cert: "<REDACTED>",
        auth: "<REDACTED>"
      }

      {output, _} =
        @test_integration_name
        |> Suma.identify()
        |> :sys.get_state()
        |> inspect
        |> Code.eval_string()

      assert expected == output
    end
  end

  describe "Setting up SUMA integration service" do
    test "should setup SUMA state", %{
      settings: %Settings{url: url, username: username, password: password, ca_cert: ca_cert}
    } do
      {:ok, _} = start_supervised({Suma, @test_integration_name})

      base_api_url = "#{url}/rhn/manager/api"
      auth_cookie = "pxt-session-cookie=4321"

      expect(SumaApiMock, :login, fn ^base_api_url, ^username, ^password ->
        successful_login_response()
      end)

      assert :ok = Suma.setup(@test_integration_name)

      expected_state = %State{
        url: url,
        username: username,
        password: password,
        ca_cert: ca_cert,
        auth: auth_cookie
      }

      assert @test_integration_name
             |> Suma.identify()
             |> :sys.get_state() == expected_state
    end

    test "should handle error when reaching maximum login retries" do
      {:ok, _} = start_supervised({Suma, @test_integration_name})

      error_causes = [
        {:ok, %HTTPoison.Response{status_code: 401}},
        {:ok, %HTTPoison.Response{status_code: 503}},
        {:error, %HTTPoison.Error{reason: "kaboom"}}
      ]

      for error_cause <- error_causes do
        expect(SumaApiMock, :login, 5, fn _, _, _ -> error_cause end)

        assert {:error, :max_login_retries_reached} = Suma.setup(@test_integration_name)

        expected_state = %State{
          url: nil,
          username: nil,
          password: nil,
          ca_cert: nil,
          auth: nil
        }

        assert @test_integration_name
               |> Suma.identify()
               |> :sys.get_state() == expected_state
      end
    end

    test "should successfully login after retrying" do
      {:ok, _} = start_supervised({Suma, @test_integration_name})

      auth_cookie = "pxt-session-cookie=4321"

      responses = [
        {:ok, %HTTPoison.Response{status_code: 401}},
        {:error, %HTTPoison.Error{reason: "kaboom"}},
        successful_login_response()
      ]

      {:ok, _} = Agent.start_link(fn -> 0 end, name: :login_call_iteration)

      expect(SumaApiMock, :login, 3, fn _, _, _ ->
        iteration = Agent.get(:login_call_iteration, & &1)

        iteration_response = Enum.at(responses, iteration)
        Agent.update(:login_call_iteration, &(&1 + 1))

        iteration_response
      end)

      assert :ok = Suma.setup(@test_integration_name)

      assert %State{
               auth: ^auth_cookie
             } =
               @test_integration_name
               |> Suma.identify()
               |> :sys.get_state()
    end
  end

  describe "clearing up integration service" do
    test "should clear service state", %{
      settings: %Settings{url: url, username: username, password: password, ca_cert: ca_cert}
    } do
      {:ok, _} = start_supervised({Suma, @test_integration_name})

      expect(SumaApiMock, :login, fn _, _, _ -> successful_login_response() end)

      assert :ok = Suma.setup(@test_integration_name)

      expected_state = %State{
        url: url,
        username: username,
        password: password,
        ca_cert: ca_cert,
        auth: "pxt-session-cookie=4321"
      }

      assert @test_integration_name
             |> Suma.identify()
             |> :sys.get_state() == expected_state

      assert :ok = Suma.clear(@test_integration_name)

      assert @test_integration_name
             |> Suma.identify()
             |> :sys.get_state() == %State{}
    end

    test "should support clearing an already empty service state" do
      {:ok, _} = start_supervised({Suma, @test_integration_name})

      empty_state = %State{
        url: nil,
        username: nil,
        password: nil,
        ca_cert: nil,
        auth: nil
      }

      assert @test_integration_name
             |> Suma.identify()
             |> :sys.get_state() == empty_state

      assert :ok = Suma.clear(@test_integration_name)

      assert @test_integration_name
             |> Suma.identify()
             |> :sys.get_state() == empty_state
    end
  end

  describe "Integration service" do
    test "should return an error when a system id was not found for a given fqdn" do
      {:ok, _} = start_supervised({Suma, @test_integration_name})

      fqdn = "machine.fqdn.internal"

      expect(SumaApiMock, :login, 1, fn _, _, _ -> successful_login_response() end)

      error_causes = [
        {:ok, %HTTPoison.Response{status_code: 200, body: ~s({"success":true,"result":[]})}},
        {:ok, %HTTPoison.Response{status_code: 404}},
        {:ok, %HTTPoison.Response{status_code: 503}},
        {:error, %HTTPoison.Error{reason: "kaboom"}}
      ]

      for error_cause <- error_causes do
        expect(SumaApiMock, :get_system_id, 1, fn _, _, ^fqdn -> error_cause end)

        assert {:error, :system_id_not_found} = Suma.get_system_id(fqdn, @test_integration_name)
      end
    end

    test "should get a system for a given fqdn" do
      {:ok, _} = start_supervised({Suma, @test_integration_name})

      fqdn = "machine.fqdn.internal"

      expect(SumaApiMock, :login, 1, fn _, _, _ -> successful_login_response() end)

      expect(SumaApiMock, :get_system_id, 1, fn _, _, ^fqdn ->
        {:ok,
         %HTTPoison.Response{
           status_code: 200,
           body: ~s({"success": true,"result": [{"id":1000010001}]})
         }}
      end)

      assert {:ok, 1_000_010_001} = Suma.get_system_id(fqdn, @test_integration_name)
    end

    test "should return an error when relevant errata was not found for a given system ID" do
      {:ok, _} = start_supervised({Suma, @test_integration_name})

      system_id = 1_000_010_001

      expect(SumaApiMock, :login, 1, fn _, _, _ -> successful_login_response() end)

      error_causes = [
        {:ok,
         %HTTPoison.Response{
           status_code: 200,
           body: ~s({"success":false,"message":"No such system - sid = 1000010001"})
         }},
        {:ok,
         %HTTPoison.Response{
           status_code: 400,
           body: "Complex types are not allowed in query string"
         }},
        {:ok,
         %HTTPoison.Response{
           status_code: 404,
           body: "No method exists with the matching parameters"
         }},
        {:ok,
         %HTTPoison.Response{
           status_code: 500,
           body: ~s({"message":"java.lang.NullPointerException"})
         }}
      ]

      for error_cause <- error_causes do
        expect(SumaApiMock, :get_relevant_patches, 1, fn _, _, ^system_id -> error_cause end)

        assert {:error, :error_getting_patches} =
                 Suma.get_relevant_patches(system_id, @test_integration_name)
      end
    end

    test "should get errata for a given system ID" do
      {:ok, _} = start_supervised({Suma, @test_integration_name})

      system_id = 1_000_010_001

      patches = [
        %{
          date: "2024-02-27",
          advisory_name: "SUSE-15-SP4-2024-630",
          advisory_type: "Bug Fix Advisory",
          advisory_status: "stable",
          id: 4182,
          advisory_synopsis: "Recommended update for cloud-netconfig",
          update_date: "2024-02-27"
        },
        %{
          date: "2024-02-26",
          advisory_name: "SUSE-15-SP4-2024-619",
          advisory_type: "Security Advisory",
          advisory_status: "stable",
          id: 4174,
          advisory_synopsis: "important: Security update for java-1_8_0-ibm",
          update_date: "2024-02-26"
        }
      ]

      suma_response_body = %{success: true, result: patches}

      expect(SumaApiMock, :login, 1, fn _, _, _ -> successful_login_response() end)

      expect(SumaApiMock, :get_relevant_patches, 1, fn _, _, ^system_id ->
        {:ok, %HTTPoison.Response{status_code: 200, body: Jason.encode!(suma_response_body)}}
      end)

      assert {:ok,
              [
                %{
                  date: "2024-02-27",
                  advisory_name: "SUSE-15-SP4-2024-630",
                  advisory_type: :bugfix,
                  advisory_status: "stable",
                  id: 4182,
                  advisory_synopsis: "Recommended update for cloud-netconfig",
                  update_date: "2024-02-27"
                },
                %{
                  date: "2024-02-26",
                  advisory_name: "SUSE-15-SP4-2024-619",
                  advisory_type: :security_advisory,
                  advisory_status: "stable",
                  id: 4174,
                  advisory_synopsis: "important: Security update for java-1_8_0-ibm",
                  update_date: "2024-02-26"
                }
              ]} =
               Suma.get_relevant_patches(system_id, @test_integration_name)
    end

    test "should handle expired authentication" do
      {:ok, _} = start_supervised({Suma, @test_integration_name})

      scenarios = [
        %{
          final_response: %HTTPoison.Response{
            status_code: 200,
            body: ~s({"success": true,"result": [{"id":1000010001}]})
          },
          expected_result: {:ok, 1_000_010_001}
        },
        %{
          final_response: %HTTPoison.Response{
            status_code: 422
          },
          expected_result: {:error, :system_id_not_found}
        }
      ]

      for %{final_response: final_response, expected_result: expected_result} <- scenarios do
        initial_auth_cookie = "pxt-session-cookie=INITIAL-COOKIE"

        expect(SumaApiMock, :login, fn _, _, _ ->
          successful_login_response(initial_auth_cookie)
        end)

        :ok = Suma.setup(@test_integration_name)

        assert %State{auth: ^initial_auth_cookie} =
                 @test_integration_name
                 |> Suma.identify()
                 |> :sys.get_state()

        new_auth_cookie = "pxt-session-cookie=NEW-COOKIE"

        SumaApiMock
        |> expect(:get_system_id, fn _, ^initial_auth_cookie, _ ->
          {:ok, %HTTPoison.Response{status_code: 401}}
        end)
        |> expect(:login, fn _, _, _ -> successful_login_response(new_auth_cookie) end)
        |> expect(:get_system_id, fn _, ^new_auth_cookie, _ -> {:ok, final_response} end)

        assert ^expected_result = Suma.get_system_id("fqdn", @test_integration_name)

        assert %State{auth: ^new_auth_cookie} =
                 @test_integration_name
                 |> Suma.identify()
                 |> :sys.get_state()
      end
    end
  end

  defp successful_login_response(
         auth_cookie \\ "pxt-session-cookie=4321",
         ignored_cookie \\ "pxt-session-cookie=1234"
       ) do
    {:ok,
     %HTTPoison.Response{
       status_code: 200,
       headers: [
         {"Set-Cookie", "JSESSIONID=FOOBAR; Path=/; Secure; HttpOnly; HttpOnly;HttpOnly;Secure"},
         {"Set-Cookie",
          "#{ignored_cookie}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:10 GMT; Path=/; Secure; HttpOnly;HttpOnly;Secure"},
         {"Set-Cookie",
          "#{auth_cookie}; Max-Age=3600; Expires=Mon, 26 Feb 2024 10:53:57 GMT; Path=/; Secure; HttpOnly;HttpOnly;Secure"}
       ]
     }}
  end
end
