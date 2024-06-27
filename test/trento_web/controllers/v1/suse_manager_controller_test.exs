defmodule TrentoWeb.V1.SUSEManagerControllerTest do
  use TrentoWeb.ConnCase, async: true
  use Trento.SoftwareUpdates.DiscoveryCase

  import OpenApiSpex.TestAssertions
  import Trento.Factory

  alias TrentoWeb.OpenApi.V1.ApiSpec

  alias TrentoWeb.OpenApi.V1.Schema.AvailableSoftwareUpdates.{
    AvailableSoftwareUpdatesResponse,
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
end
