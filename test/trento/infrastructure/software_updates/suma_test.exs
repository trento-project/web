defmodule Trento.Infrastructure.SoftwareUpdates.SumaTest do
  use Trento.DataCase

  import Mox

  import Trento.Factory

  alias Trento.Infrastructure.SoftwareUpdates.Suma

  alias Trento.Infrastructure.SoftwareUpdates.Auth.Mock, as: SumaAuthMock
  alias Trento.Infrastructure.SoftwareUpdates.Auth.State
  alias Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor.Mock, as: SumaApiMock

  setup [:set_mox_from_context, :verify_on_exit!]

  describe "Setup SUMA connection" do
    test "should setup with successful authentication" do
      expect(SumaAuthMock, :authenticate, fn ->
        {:ok, %State{}}
      end)

      assert :ok = Suma.setup()
    end

    test "should fail during setup when authentication fails" do
      expect(SumaAuthMock, :authenticate, fn ->
        {:error, :auth_error}
      end)

      assert {:error, :auth_error} = Suma.setup()
    end
  end

  describe "Clear authentication data" do
    test "should clear authentication state" do
      expect(SumaAuthMock, :clear, fn ->
        :ok
      end)

      assert :ok = Suma.clear()
    end
  end

  describe "Integration service" do
    test "should return an error when a system id was not found for a given fqdn" do
      fqdn = "machine.fqdn.internal"

      error_causes = [
        {:ok, %HTTPoison.Response{status_code: 200, body: ~s({"success":true,"result":[]})}},
        {:ok, %HTTPoison.Response{status_code: 404}},
        {:ok, %HTTPoison.Response{status_code: 503}},
        {:error, %HTTPoison.Error{reason: "kaboom"}}
      ]

      for error_cause <- error_causes do
        expect(SumaAuthMock, :authenticate, 1, fn -> {:ok, authenticated_state()} end)
        expect(SumaApiMock, :get_system_id, 1, fn _, _, ^fqdn, _ -> error_cause end)

        assert {:error, :system_id_not_found} =
                 Suma.get_system_id(fqdn)
      end
    end

    test "should get a system for a given fqdn" do
      fqdn = "machine.fqdn.internal"

      expect(SumaAuthMock, :authenticate, 1, fn -> {:ok, authenticated_state()} end)

      expect(SumaApiMock, :get_system_id, 1, fn _, _, ^fqdn, _ ->
        {:ok,
         %HTTPoison.Response{
           status_code: 200,
           body: ~s({"success": true,"result": [{"id":1000010001}]})
         }}
      end)

      assert {:ok, 1_000_010_001} = Suma.get_system_id(fqdn)
    end

    test "should return an error when relevant errata was not found for a given system ID" do
      system_id = 1_000_010_001

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
        expect(SumaAuthMock, :authenticate, 1, fn -> {:ok, authenticated_state()} end)
        expect(SumaApiMock, :get_relevant_patches, 1, fn _, _, ^system_id, _ -> error_cause end)

        assert {:error, :error_getting_patches} =
                 Suma.get_relevant_patches(system_id)
      end
    end

    test "should get errata for a given system ID" do
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

      expect(SumaAuthMock, :authenticate, 1, fn -> {:ok, authenticated_state()} end)

      expect(SumaApiMock, :get_relevant_patches, 1, fn _, _, ^system_id, _ ->
        {:ok,
         %HTTPoison.Response{
           status_code: 200,
           body: Jason.encode!(suma_response_body)
         }}
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
               Suma.get_relevant_patches(system_id)
    end

    test "should get upgradable packages for a given system ID" do
      system_id = 1_000_010_001

      %{result: upgradable_packages} =
        suma_response_body = %{success: true, result: build_list(10, :upgradable_package)}

      expect(SumaAuthMock, :authenticate, 1, fn -> {:ok, authenticated_state()} end)

      expect(SumaApiMock, :get_upgradable_packages, 1, fn _, _, ^system_id, _ ->
        {:ok, %HTTPoison.Response{status_code: 200, body: Jason.encode!(suma_response_body)}}
      end)

      expected_upgradable_packages = Enum.map(upgradable_packages, &Map.from_struct/1)

      assert {:ok, ^expected_upgradable_packages} =
               Suma.get_upgradable_packages(system_id)
    end

    test "should return a proper error when getting upgradable packages fails" do
      system_id = 1_000_010_001

      expect(SumaAuthMock, :authenticate, 1, fn -> {:ok, authenticated_state()} end)

      expect(SumaApiMock, :get_upgradable_packages, 1, fn _, _, ^system_id, _ ->
        {:ok, %HTTPoison.Response{status_code: 500, body: Jason.encode!(%{})}}
      end)

      assert {:error, :error_getting_packages} =
               Suma.get_upgradable_packages(system_id)
    end

    test "should get patches for a single package" do
      package_id = Faker.UUID.v4()

      %{result: patches} =
        suma_response_body = %{success: true, result: build_list(10, :patch_for_package)}

      expect(SumaAuthMock, :authenticate, 1, fn -> {:ok, authenticated_state()} end)

      expect(SumaApiMock, :get_patches_for_package, 1, fn _, _, ^package_id, _ ->
        {:ok, %HTTPoison.Response{status_code: 200, body: Jason.encode!(suma_response_body)}}
      end)

      assert {:ok, ^patches} =
               Suma.get_patches_for_package(package_id)
    end

    test "should return a proper error when getting patches for a specific package fails" do
      package_id = Faker.UUID.v4()

      expect(SumaAuthMock, :authenticate, 1, fn -> {:ok, authenticated_state()} end)

      expect(SumaApiMock, :get_patches_for_package, 1, fn _, _, ^package_id, _ ->
        {:ok, %HTTPoison.Response{status_code: 500, body: Jason.encode!(%{})}}
      end)

      assert {:error, :error_getting_patches} =
               Suma.get_patches_for_package(package_id)
    end

    test "should get affected systems for a single patch" do
      advisory_name = Faker.UUID.v4()

      %{result: affected_systems} =
        suma_response_body = %{success: true, result: build_list(10, :affected_system)}

      expect(SumaAuthMock, :authenticate, 1, fn -> {:ok, authenticated_state()} end)

      expect(SumaApiMock, :get_affected_systems, 1, fn _, _, ^advisory_name, _ ->
        {:ok, %HTTPoison.Response{status_code: 200, body: Jason.encode!(suma_response_body)}}
      end)

      assert {:ok, ^affected_systems} =
               Suma.get_affected_systems(advisory_name)
    end

    test "should return a proper error when getting affected systems for a patch fails" do
      advisory_name = Faker.UUID.v4()

      expect(SumaAuthMock, :authenticate, 1, fn -> {:ok, authenticated_state()} end)

      expect(SumaApiMock, :get_affected_systems, 1, fn _, _, ^advisory_name, _ ->
        {:ok, %HTTPoison.Response{status_code: 500, body: Jason.encode!(%{})}}
      end)

      assert {:error, :error_getting_affected_systems} =
               Suma.get_affected_systems(advisory_name)
    end

    test "should get covered CVEs for a single patch" do
      advisory_name = Faker.UUID.v4()

      %{result: cves} =
        suma_response_body = %{success: true, result: build_list(10, :cve)}

      expect(SumaAuthMock, :authenticate, 1, fn -> {:ok, authenticated_state()} end)

      expect(SumaApiMock, :get_cves, 1, fn _, _, ^advisory_name, _ ->
        {:ok, %HTTPoison.Response{status_code: 200, body: Jason.encode!(suma_response_body)}}
      end)

      assert {:ok, ^cves} = Suma.get_cves(advisory_name)
    end

    test "should return a proper error when getting CVEs for a patch fails" do
      advisory_name = Faker.UUID.v4()

      expect(SumaAuthMock, :authenticate, 1, fn -> {:ok, authenticated_state()} end)

      expect(SumaApiMock, :get_cves, 1, fn _, _, ^advisory_name, _ ->
        {:ok, %HTTPoison.Response{status_code: 500, body: Jason.encode!(%{})}}
      end)

      assert {:error, :error_getting_cves} =
               Suma.get_cves(advisory_name)
    end

    test "should get affected packages for a single patch" do
      advisory_name = Faker.UUID.v4()

      %{result: affected_packages} =
        suma_response_body = %{success: true, result: build_list(10, :affected_package)}

      expect(SumaAuthMock, :authenticate, 1, fn -> {:ok, authenticated_state()} end)

      expect(SumaApiMock, :get_affected_packages, 1, fn _, _, ^advisory_name, _ ->
        {:ok, %HTTPoison.Response{status_code: 200, body: Jason.encode!(suma_response_body)}}
      end)

      assert {:ok, ^affected_packages} =
               Suma.get_affected_packages(advisory_name)
    end

    test "should return a proper error when getting affected packages for a patch fails" do
      advisory_name = Faker.UUID.v4()

      expect(SumaAuthMock, :authenticate, 1, fn -> {:ok, authenticated_state()} end)

      expect(SumaApiMock, :get_affected_packages, 1, fn _, _, ^advisory_name, _ ->
        {:ok, %HTTPoison.Response{status_code: 500, body: Jason.encode!(%{})}}
      end)

      assert {:error, :error_getting_affected_packages} =
               Suma.get_affected_packages(advisory_name)
    end

    test "should get details for a single errata" do
      advisory_name = Faker.UUID.v4()

      %{result: errata_details} =
        suma_response_body = %{success: true, result: build(:errata_details)}

      expect(SumaAuthMock, :authenticate, 1, fn -> {:ok, authenticated_state()} end)

      expect(SumaApiMock, :get_errata_details, 1, fn _, _, ^advisory_name, _ ->
        {:ok, %HTTPoison.Response{status_code: 200, body: Jason.encode!(suma_response_body)}}
      end)

      assert {:ok, ^errata_details} =
               Suma.get_errata_details(advisory_name)
    end

    test "should return a proper error when getting errata details" do
      advisory_name = Faker.UUID.v4()

      expect(SumaAuthMock, :authenticate, 1, fn -> {:ok, authenticated_state()} end)

      expect(SumaApiMock, :get_errata_details, 1, fn _, _, ^advisory_name, _ ->
        {:ok, %HTTPoison.Response{status_code: 500, body: Jason.encode!(%{})}}
      end)

      assert {:error, :error_getting_errata_details} =
               Suma.get_errata_details(advisory_name)
    end

    test "should get Bugzilla fixes for an advisory" do
      advisory_name = Faker.UUID.v4()

      %{result: fixes} =
        suma_response_body = %{success: true, result: build(:bugzilla_fix)}

      expect(SumaAuthMock, :authenticate, 1, fn -> {:ok, authenticated_state()} end)

      expect(SumaApiMock, :get_bugzilla_fixes, 1, fn _, _, ^advisory_name, _ ->
        {:ok, %HTTPoison.Response{status_code: 200, body: Jason.encode!(suma_response_body)}}
      end)

      {:ok, ^fixes} = Suma.get_bugzilla_fixes(advisory_name)
    end

    test "should handle expired authentication" do
      fqdn = "machine.fqdn.internal"

      auth_state1 = Map.put(authenticated_state(), :auth, "cookie1")
      auth_state2 = Map.put(authenticated_state(), :auth, "cookie2")

      expect(SumaAuthMock, :authenticate, fn -> {:ok, auth_state1} end)
      expect(SumaAuthMock, :authenticate, fn -> {:ok, auth_state2} end)
      expect(SumaAuthMock, :clear, fn -> :ok end)

      expect(SumaApiMock, :get_system_id, 1, fn _, "cookie1", ^fqdn, _ ->
        {:ok, %HTTPoison.Response{status_code: 401}}
      end)

      expect(SumaApiMock, :get_system_id, 1, fn _, "cookie2", ^fqdn, _ ->
        {:ok,
         %HTTPoison.Response{
           status_code: 200,
           body: ~s({"success": true,"result": [{"id":1000010001}]})
         }}
      end)

      assert {:ok, 1_000_010_001} = Suma.get_system_id(fqdn)
    end
  end

  defp authenticated_state do
    %State{
      url: "https://test",
      username: "user",
      password: "password",
      ca_cert: "cert",
      auth: "cookie"
    }
  end
end
