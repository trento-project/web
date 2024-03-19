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
      %{id: host_id} = insert(:host)

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

    test "should return 404 when a host is not found", %{
      conn: conn,
      api_spec: api_spec
    } do
      host_id = Faker.UUID.v4()

      conn
      |> get("/api/v1/hosts/#{host_id}/software_updates")
      |> json_response(:not_found)
      |> assert_schema("NotFound", api_spec)
    end

    test "should return 422 when a host does not have an fqdn", %{
      conn: conn,
      api_spec: api_spec
    } do
      %{id: host_id} = insert(:host, fully_qualified_domain_name: nil)

      conn
      |> get("/api/v1/hosts/#{host_id}/software_updates")
      |> json_response(:unprocessable_entity)
      |> assert_schema("UnprocessableEntity", api_spec)
    end
  end
end
