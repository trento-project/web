defmodule TrentoWeb.V1.SUSEManagerControllerTest do
  use TrentoWeb.ConnCase, async: true
  use Trento.SoftwareUpdates.DiscoveryCase

  import Mox
  import OpenApiSpex.TestAssertions
  import Trento.Factory

  alias TrentoWeb.OpenApi.V1.ApiSpec

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

      %{
        relevant_patches: [
          %{
            id: 4182
          },
          %{
            id: 4174
          }
        ],
        upgradable_packages: [
          %{
            name: "elixir"
          },
          %{
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
                 %{"detail" => "SUSE Manager settings not configured.", "title" => "Not Found"}
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

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_patches_for_package, 3, fn _ ->
        {:ok, build_list(10, :patch_for_package)}
      end)

      %{
        patches: [
          %{package_id: _, patches: _},
          %{package_id: _, patches: _}
        ]
      } =
        conn
        |> get("/api/v1/software_updates/packages?host_id=#{host_id}")
        |> json_response(:ok)
        |> assert_schema("PatchesForPackagesResponse", api_spec)
    end

    test "should return an error if at least one package query fails", %{
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

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_affected_packages, 1, fn _ ->
        {:ok, build_list(10, :affected_package)}
      end)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_affected_packages, 1, fn _ ->
        {:error, :error_getting_affected_packages}
      end)

      conn
      |> get("/api/v1/software_updates/packages?host_id=#{host_id}")
      |> json_response(:unprocessable_entity)
      |> assert_schema("UnprocessableEntity", api_spec)
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

      cves = build_list(10, :cve)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_cves, 1, fn _ ->
        {:ok, cves}
      end)

      fixes = build(:bugzilla_fix)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_bugzilla_fixes, 1, fn _ ->
        {:ok, fixes}
      end)

      affected_packages = build_list(10, :affected_package)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_affected_packages, 1, fn _ ->
        {:ok, affected_packages}
      end)

      affected_systems = build_list(10, :affected_system)

      Enum.each(affected_systems, fn %{name: system} ->
        insert(:host, hostname: system)
      end)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_affected_systems, 1, fn _ ->
        {:ok, affected_systems}
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

      %{
        errata_details: %{
          id: ^id,
          issue_date: ^issue_date,
          update_date: ^update_date,
          last_modified_date: ^last_modified_date,
          synopsis: ^synopsis,
          release: ^release,
          advisory_status: ^advisory_status,
          vendor_advisory: ^vendor_advisory,
          type: "bugfix",
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
        cves: ^cves,
        affected_packages: ^affected_packages,
        affected_systems: ^affected_systems
      } = result
    end

    test "should filter out non-registered hosts from affected systems", %{
      conn: conn,
      api_spec: api_spec
    } do
      insert_software_updates_settings()

      advisory_name = Faker.Pokemon.name()

      errata_details = build(:errata_details)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_errata_details, 1, fn _ ->
        {:ok, errata_details}
      end)

      cves = build_list(10, :cve)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_cves, 1, fn _ ->
        {:ok, cves}
      end)

      fixes = build(:bugzilla_fix)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_bugzilla_fixes, 1, fn _ ->
        {:ok, fixes}
      end)

      affected_packages = build_list(10, :affected_package)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_affected_packages, 1, fn _ ->
        {:ok, affected_packages}
      end)

      [%{name: first_affected_system} | _] = affected_systems = build_list(10, :affected_system)

      insert(:host, fully_qualified_domain_name: first_affected_system)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_affected_systems, 1, fn _ ->
        {:ok, affected_systems}
      end)

      json =
        conn
        |> get("/api/v1/software_updates/errata_details/#{advisory_name}")
        |> json_response(:ok)

      result = assert_schema(json, "ErrataDetailsResponse", api_spec)

      %{
        affected_systems: [%{name: ^first_affected_system}]
      } = result
    end

    error_scenarios = [
      %{
        name: "advisory details not found",
        mocks: [
          get_errata_details: {:error, :error_getting_errata_details},
          get_cves: {:ok, build_list(10, :cve)},
          get_bugzilla_fixes: {:ok, build(:bugzilla_fix)},
          get_affected_packages: {:ok, build_list(10, :affected_package)},
          get_affected_systems: {:ok, build_list(10, :affected_system)}
        ]
      },
      %{
        name: "CVEs not found",
        mocks: [
          get_errata_details: {:ok, build(:errata_details)},
          get_cves: {:error, :error_getting_cves},
          get_bugzilla_fixes: {:ok, build(:bugzilla_fix)},
          get_affected_packages: {:ok, build_list(10, :affected_package)},
          get_affected_systems: {:ok, build_list(10, :affected_system)}
        ]
      },
      %{
        name: "advisory fixes not found",
        mocks: [
          get_errata_details: {:ok, build(:errata_details)},
          get_cves: {:ok, build_list(10, :cve)},
          get_bugzilla_fixes: {:error, :error_getting_fixes},
          get_affected_packages: {:ok, build_list(10, :affected_package)},
          get_affected_systems: {:ok, build_list(10, :affected_system)}
        ]
      },
      %{
        name: "affected packages not found",
        mocks: [
          get_errata_details: {:ok, build(:errata_details)},
          get_cves: {:ok, build_list(10, :cve)},
          get_bugzilla_fixes: {:ok, build(:bugzilla_fix)},
          get_affected_packages: {:error, :error_getting_affected_packages},
          get_affected_systems: {:ok, build_list(10, :affected_system)}
        ]
      },
      %{
        name: "affected systems not found",
        mocks: [
          get_errata_details: {:ok, build(:errata_details)},
          get_cves: {:ok, build_list(10, :cve)},
          get_bugzilla_fixes: {:ok, build(:bugzilla_fix)},
          get_affected_packages: {:ok, build_list(10, :affected_package)},
          get_affected_systems: {:error, :error_getting_affected_systems}
        ]
      }
    ]

    for %{name: name} = scenario <- error_scenarios do
      @scenario scenario

      test "should return 422 when #{name}", %{conn: conn, api_spec: api_spec} do
        %{mocks: mocks} = @scenario

        Enum.each(mocks, fn {network_call, response} ->
          expect(Trento.SoftwareUpdates.Discovery.Mock, network_call, 1, fn _ -> response end)
        end)

        advisory_name = Faker.Pokemon.name()

        conn
        |> get("/api/v1/software_updates/errata_details/#{advisory_name}")
        |> json_response(:unprocessable_entity)
        |> assert_schema("UnprocessableEntity", api_spec)
      end
    end

    unauthorized_scenarios = [
      %{
        name: "get_errata_details unauthorized",
        mocks: [
          get_errata_details: {:error, :suma_authentication_error},
          get_cves: {:ok, build_list(10, :cve)},
          get_bugzilla_fixes: {:ok, build(:bugzilla_fix)},
          get_affected_packages: {:ok, build_list(10, :affected_package)},
          get_affected_systems: {:ok, build_list(10, :affected_system)}
        ]
      },
      %{
        name: "get_cves unauthorized",
        mocks: [
          get_errata_details: {:ok, build(:errata_details)},
          get_cves: {:error, :suma_authentication_error},
          get_bugzilla_fixes: {:ok, build(:bugzilla_fix)},
          get_affected_packages: {:ok, build_list(10, :affected_package)},
          get_affected_systems: {:ok, build_list(10, :affected_system)}
        ]
      },
      %{
        name: "get_bugzilla_fixes unauthorized",
        mocks: [
          get_errata_details: {:ok, build(:errata_details)},
          get_cves: {:ok, build_list(10, :cve)},
          get_bugzilla_fixes: {:error, :suma_authentication_error},
          get_affected_packages: {:ok, build_list(10, :affected_package)},
          get_affected_systems: {:ok, build_list(10, :affected_system)}
        ]
      },
      %{
        name: "get_affected_packages unauthorized",
        mocks: [
          get_errata_details: {:ok, build(:errata_details)},
          get_cves: {:ok, build_list(10, :cve)},
          get_bugzilla_fixes: {:ok, build(:bugzilla_fix)},
          get_affected_packages: {:error, :suma_authentication_error},
          get_affected_systems: {:ok, build_list(10, :affected_system)}
        ]
      },
      %{
        name: "get_affected_systems unauthorized",
        mocks: [
          get_errata_details: {:ok, build(:errata_details)},
          get_cves: {:ok, build_list(10, :cve)},
          get_bugzilla_fixes: {:ok, build(:bugzilla_fix)},
          get_affected_packages: {:ok, build_list(10, :affected_package)},
          get_affected_systems: {:error, :suma_authentication_error}
        ]
      }
    ]

    for %{name: name} = scenario <- unauthorized_scenarios do
      @scenario scenario

      test "should return 422 for #{name}", %{conn: conn, api_spec: api_spec} do
        %{mocks: mocks} = @scenario

        Enum.each(mocks, fn {network_call, response} ->
          expect(Trento.SoftwareUpdates.Discovery.Mock, network_call, 1, fn _ -> response end)
        end)

        advisory_name = Faker.Pokemon.name()

        conn
        |> get("/api/v1/software_updates/errata_details/#{advisory_name}")
        |> json_response(:unprocessable_entity)
        |> assert_schema("UnprocessableEntity", api_spec)
      end
    end
  end
end
