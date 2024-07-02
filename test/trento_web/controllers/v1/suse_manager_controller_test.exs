defmodule TrentoWeb.V1.SUSEManagerControllerTest do
  use TrentoWeb.ConnCase, async: true
  use Trento.SoftwareUpdates.DiscoveryCase

  import Mox
  import OpenApiSpex.TestAssertions
  import Trento.Factory

  alias TrentoWeb.OpenApi.V1.ApiSpec

  alias TrentoWeb.OpenApi.V1.Schema.AvailableSoftwareUpdates.{
    AvailableSoftwareUpdatesResponse,
    ErrataDetailsResponse,
    PatchesForPackage,
    PatchesForPackagesResponse,
    RelevantPatch,
    UpgradablePackage
  }

  setup do
    %{api_spec: ApiSpec.spec()}
  end

  describe "retrieve available software updates info" do
    test "should return upgradable packages and relevant patches", %{
      conn: conn,
      api_spec: api_spec
    } do
      insert_software_updates_settings()

      relevant_patches = [
        build(:relevant_patch, id: 4182),
        build(:relevant_patch, id: 4174)
      ]

      upgradable_packages = [
        build(:upgradable_package, name: "elixir"),
        build(:upgradable_package, name: "systemd")
      ]

      %{host_id: host_id} =
        insert(:software_updates_discovery_result,
          relevant_patches: relevant_patches,
          upgradable_packages: upgradable_packages
        )

      %AvailableSoftwareUpdatesResponse{
        relevant_patches: [
          %RelevantPatch{
            id: 4182
          },
          %RelevantPatch{
            id: 4174
          }
        ],
        upgradable_packages: [
          %UpgradablePackage{
            name: "elixir"
          },
          %UpgradablePackage{
            name: "systemd"
          }
        ]
      } =
        conn
        |> get("/api/v1/hosts/#{host_id}/software_updates")
        |> json_response(:ok)
        |> assert_schema("AvailableSoftwareUpdatesResponse", api_spec)
    end

    test "should return 403 when no settings have been saved", %{conn: conn} do
      %{id: host_id} = insert(:host)

      resp =
        conn
        |> get("/api/v1/hosts/#{host_id}/software_updates")
        |> json_response(:not_found)

      assert %{
               "errors" => [
                 %{"detail" => "The requested resource cannot be found.", "title" => "Not Found"}
               ]
             } == resp
    end

    test "should return 404 when a host is not found", %{
      conn: conn,
      api_spec: api_spec
    } do
      insert_software_updates_settings()
      host_id = Faker.UUID.v4()

      conn
      |> get("/api/v1/hosts/#{host_id}/software_updates")
      |> json_response(:not_found)
      |> assert_schema("NotFound", api_spec)
    end
  end

  describe "retrieve upgradable packages related patches" do
    test "should return relevant patches grouped by package id", %{conn: conn, api_spec: api_spec} do
      insert_software_updates_settings()

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_patches_for_package, 3, fn _ ->
        {:ok, build_list(10, :patch_for_package)}
      end)

      %PatchesForPackagesResponse{
        patches: [
          %PatchesForPackage{package_id: _, patches: _},
          %PatchesForPackage{package_id: _, patches: _}
        ]
      } =
        conn
        |> get(
          "/api/v1/software_updates/packages?package_ids[]=#{Faker.UUID.v4()}&package_ids[]=#{Faker.UUID.v4()}"
        )
        |> json_response(:ok)
        |> assert_schema("PatchesForPackagesResponse", api_spec)
    end

    test "should return an empty list if every call errors", %{conn: conn, api_spec: api_spec} do
      insert_software_updates_settings()

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_patches_for_package, 3, fn _ ->
        {:error, :error_getting_patches}
      end)

      %PatchesForPackagesResponse{
        patches: [
          %PatchesForPackage{package_id: _, patches: []},
          %PatchesForPackage{package_id: _, patches: []}
        ]
      } =
        conn
        |> get(
          "/api/v1/software_updates/packages?package_ids[]=#{Faker.UUID.v4()}&package_ids[]=#{Faker.UUID.v4()}"
        )
        |> json_response(:ok)
        |> assert_schema("PatchesForPackagesResponse", api_spec)
    end
  end

  describe "retrieve errata details" do
    test "should return errata details", %{conn: conn, api_spec: api_spec} do
      insert_software_updates_settings()

      advisory_name = Faker.Pokemon.name()

      %{
        id: id,
        issue_date: issue_date,
        update_date: update_date,
        last_modified_date: last_modified_date,
        synopsis: synopsis,
        release: release,
        advisory_status: advisory_status,
        vendor_advisory: vendor_advisory,
        type: type,
        product: product,
        errataFrom: errata_from,
        topic: topic,
        description: description,
        references: references,
        notes: notes,
        solution: solution,
        reboot_suggested: reboot_suggested,
        restart_suggested: restart_suggested
      } = errata_details = build(:errata_details)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_errata_details, 1, fn _ ->
        {:ok, errata_details}
      end)

      cves = generate_cves(10)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_cves, 1, fn _ ->
        {:ok, cves}
      end)

      fixes = build(:bugzilla_fix)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_bugzilla_fixes, 1, fn _ ->
        {:ok, fixes}
      end)

      json =
        conn
        |> get("/api/v1/software_updates/errata_details/#{advisory_name}")
        |> json_response(:ok)

      %{"fixes" => json_fixes} = json

      # The returned struct from `assert_schema/3` empties the dynamic Map in `fixes`.
      # Assert on the JSON response that the `fixes` Map contains entries.
      assert fixes |> Map.keys() |> length == json_fixes |> Map.keys() |> length

      result = assert_schema(json, "ErrataDetailsResponse", api_spec)

      %ErrataDetailsResponse{
        errata_details: %{
          id: ^id,
          issue_date: ^issue_date,
          update_date: ^update_date,
          last_modified_date: ^last_modified_date,
          synopsis: ^synopsis,
          release: ^release,
          advisory_status: ^advisory_status,
          vendor_advisory: ^vendor_advisory,
          type: ^type,
          product: ^product,
          errata_from: ^errata_from,
          topic: ^topic,
          description: ^description,
          references: ^references,
          notes: ^notes,
          solution: ^solution,
          reboot_suggested: ^reboot_suggested,
          restart_suggested: ^restart_suggested
        },
        cves: ^cves
      } = result
    end

    test "should return 422 when advisory details are not found", %{
      conn: conn,
      api_spec: api_spec
    } do
      insert_software_updates_settings()

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_errata_details, 1, fn _ ->
        {:error, :error_getting_errata_details}
      end)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_cves, 1, fn _ ->
        {:ok, generate_cves(10)}
      end)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_bugzilla_fixes, 1, fn _ ->
        {:ok, build(:bugzilla_fix)}
      end)

      advisory_name = Faker.Pokemon.name()

      conn
      |> get("/api/v1/software_updates/errata_details/#{advisory_name}")
      |> json_response(:unprocessable_entity)
      |> assert_schema("UnprocessableEntity", api_spec)
    end

    test "should return 422 when advisory CVEs are not found", %{
      conn: conn,
      api_spec: api_spec
    } do
      insert_software_updates_settings()

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_errata_details, 1, fn _ ->
        {:ok, build(:errata_details)}
      end)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_cves, 1, fn _ ->
        {:error, :error_getting_cves}
      end)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_bugzilla_fixes, 1, fn _ ->
        {:ok, build(:bugzilla_fix)}
      end)

      advisory_name = Faker.Pokemon.name()

      conn
      |> get("/api/v1/software_updates/errata_details/#{advisory_name}")
      |> json_response(:unprocessable_entity)
      |> assert_schema("UnprocessableEntity", api_spec)
    end

    test "should return 422 when advisory fixes are not found", %{
      conn: conn,
      api_spec: api_spec
    } do
      insert_software_updates_settings()

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_errata_details, 1, fn _ ->
        {:ok, build(:errata_details)}
      end)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_cves, 1, fn _ ->
        {:ok, generate_cves(10)}
      end)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_bugzilla_fixes, 1, fn _ ->
        {:error, :error_getting_fixes}
      end)

      advisory_name = Faker.Pokemon.name()

      conn
      |> get("/api/v1/software_updates/errata_details/#{advisory_name}")
      |> json_response(:unprocessable_entity)
      |> assert_schema("UnprocessableEntity", api_spec)
    end
  end

  defp generate_cves(n) do
    Enum.map(
      1..n,
      fn _ ->
        year = Enum.random(1_991..2_024)
        id = Enum.random(0..9_999)
        "CVE-#{year}-#{id}"
      end
    )
  end
end
