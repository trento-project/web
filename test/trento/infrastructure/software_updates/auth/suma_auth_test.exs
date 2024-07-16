defmodule Trento.Infrastructure.SoftwareUpdates.Auth.SumaAuthTest do
  use Trento.DataCase

  import Mox

  import Trento.Factory

  alias Trento.Infrastructure.SoftwareUpdates.Auth.{
    State,
    SumaAuth
  }

  alias Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor.Mock, as: SumaApiMock
  alias Trento.Settings.SuseManagerSettings

  setup [:set_mox_from_context, :verify_on_exit!]

  @test_integration_name "test_integration"

  defp setup_initial_settings, do: {:ok, %{settings: insert_software_updates_settings()}}

  describe "Process start up and identification" do
    test "should find an already started SUMA process" do
      assert {_, {:already_started, pid}} = start_supervised(SumaAuth)

      assert pid == SumaAuth.identify()
    end

    test "should start a new identifiable process" do
      assert {:ok, pid} = start_supervised({SumaAuth, @test_integration_name})

      assert pid == SumaAuth.identify(@test_integration_name)
    end

    test "should have expected initial state" do
      {_, {:already_started, _}} = start_supervised(SumaAuth)
      {:ok, _} = start_supervised({SumaAuth, @test_integration_name})

      expected_state = %State{
        url: nil,
        username: nil,
        password: nil,
        ca_cert: nil,
        auth: nil
      }

      assert :sys.get_state(SumaAuth.identify()) == expected_state
      assert :sys.get_state(SumaAuth.identify(@test_integration_name)) == expected_state
    end
  end

  describe "Authenticate" do
    setup do
      setup_initial_settings()
    end

    test "should redact sensitive data in SUMA state", %{
      settings: %SuseManagerSettings{url: url, username: username, password: password}
    } do
      {:ok, _} = start_supervised({SumaAuth, @test_integration_name})

      base_api_url = "#{url}/rhn/manager/api"

      expect(SumaApiMock, :login, fn ^base_api_url, ^username, ^password, _ ->
        successful_login_response()
      end)

      assert {:ok, %State{username: ^username}} = SumaAuth.authenticate(@test_integration_name)

      expected = %{
        url: url,
        username: username,
        password: "<REDACTED>",
        ca_cert: "<REDACTED>",
        auth: "<REDACTED>"
      }

      {output, _} =
        @test_integration_name
        |> SumaAuth.identify()
        |> :sys.get_state()
        |> inspect
        |> Code.eval_string()

      assert expected == output
    end

    test "should use an already authenticated auth cookie", %{
      settings: %SuseManagerSettings{url: url, username: username, password: password}
    } do
      {:ok, _} = start_supervised({SumaAuth, @test_integration_name})

      base_api_url = "#{url}/rhn/manager/api"

      expect(SumaApiMock, :login, 1, fn ^base_api_url, ^username, ^password, _ ->
        successful_login_response()
      end)

      assert {:ok, %State{username: ^username, ca_cert: initial_cookie}} =
               SumaAuth.authenticate(@test_integration_name)

      assert {:ok, %State{username: ^username, ca_cert: ^initial_cookie}} =
               SumaAuth.authenticate(@test_integration_name)
    end

    test "should handle error when reaching maximum login retries" do
      {:ok, _} = start_supervised({SumaAuth, @test_integration_name})

      error_causes = [
        {:ok, %HTTPoison.Response{status_code: 401}},
        {:ok, %HTTPoison.Response{status_code: 503}},
        {:error, %HTTPoison.Error{reason: "kaboom"}}
      ]

      for error_cause <- error_causes do
        expect(SumaApiMock, :login, 5, fn _, _, _, _ -> error_cause end)

        assert {:error, :max_login_retries_reached} =
                 SumaAuth.authenticate(@test_integration_name)

        expected_state = %State{
          url: nil,
          username: nil,
          password: nil,
          ca_cert: nil,
          auth: nil
        }

        assert @test_integration_name
               |> SumaAuth.identify()
               |> :sys.get_state() == expected_state
      end
    end

    test "should successfully login after retrying" do
      {:ok, _} = start_supervised({SumaAuth, @test_integration_name})

      auth_cookie = "pxt-session-cookie=4321"

      responses = [
        {:ok, %HTTPoison.Response{status_code: 401}},
        {:error, %HTTPoison.Error{reason: "kaboom"}},
        successful_login_response()
      ]

      {:ok, _} = Agent.start_link(fn -> 0 end, name: :login_call_iteration)

      expect(SumaApiMock, :login, 3, fn _, _, _, _ ->
        iteration = Agent.get(:login_call_iteration, & &1)

        iteration_response = Enum.at(responses, iteration)
        Agent.update(:login_call_iteration, &(&1 + 1))

        iteration_response
      end)

      assert {:ok, %State{auth: ^auth_cookie}} = SumaAuth.authenticate(@test_integration_name)
    end
  end

  describe "Authenticate without settings" do
    test "should return an error when settings are not configured" do
      {:ok, _} = start_supervised({SumaAuth, @test_integration_name})

      assert {:error, :settings_not_configured} = SumaAuth.authenticate(@test_integration_name)
    end
  end

  describe "clearing up integration service" do
    setup do
      setup_initial_settings()
    end

    test "should clear service state", %{
      settings: %SuseManagerSettings{
        url: url,
        username: username,
        password: password,
        ca_cert: ca_cert
      }
    } do
      {:ok, _} = start_supervised({SumaAuth, @test_integration_name})

      expect(SumaApiMock, :login, fn _, _, _, _ -> successful_login_response() end)

      expected_state = %State{
        url: url,
        username: username,
        password: password,
        ca_cert: ca_cert,
        auth: "pxt-session-cookie=4321"
      }

      assert {:ok, ^expected_state} = SumaAuth.authenticate(@test_integration_name)

      assert :ok = SumaAuth.clear(@test_integration_name)

      assert @test_integration_name
             |> SumaAuth.identify()
             |> :sys.get_state() == %State{}
    end

    test "should support clearing an already empty service state" do
      {:ok, _} = start_supervised({SumaAuth, @test_integration_name})

      empty_state = %State{
        url: nil,
        username: nil,
        password: nil,
        ca_cert: nil,
        auth: nil
      }

      assert @test_integration_name
             |> SumaAuth.identify()
             |> :sys.get_state() == empty_state

      assert :ok = SumaAuth.clear(@test_integration_name)

      assert @test_integration_name
             |> SumaAuth.identify()
             |> :sys.get_state() == empty_state
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
