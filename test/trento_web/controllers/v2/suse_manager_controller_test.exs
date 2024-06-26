defmodule TrentoWeb.V2.SUSEManagerControllerTest do
  use TrentoWeb.ConnCase, async: true
  use Trento.SoftwareUpdates.DiscoveryCase

  import Mox
  import OpenApiSpex.TestAssertions
  import Trento.Factory

  alias TrentoWeb.OpenApi.V2.ApiSpec

  alias TrentoWeb.OpenApi.V2.Schema.AvailableSoftwareUpdates.ErrataDetailsResponse

  setup do
    %{api_spec: ApiSpec.spec()}
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

      fixes = build(:bugzilla_fix)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_bugzilla_fixes, 1, fn _ ->
        {:ok, fixes}
      end)

      json =
        conn
        |> get("/api/v2/software_updates/errata_details/#{advisory_name}")
        |> json_response(:ok)

      %{"fixes" => json_fixes} = json

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
        }
      } = result
    end

    test "should return 404 when advisory details are not found", %{
      conn: conn,
      api_spec: api_spec
    } do
      insert_software_updates_settings()

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_errata_details, 1, fn _ ->
        {:error, :error_getting_errata_details}
      end)

      advisory_name = Faker.Pokemon.name()

      conn
      |> get("/api/v2/software_updates/errata_details/#{advisory_name}")
      |> json_response(:unprocessable_entity)
      |> assert_schema("UnprocessableEntity", api_spec)
    end
  end
end
