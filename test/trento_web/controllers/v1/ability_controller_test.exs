defmodule TrentoWeb.V1.AbilityControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions
  import TrentoWeb.ChannelCase
  import Trento.Factory

  alias TrentoWeb.OpenApi.V1.ApiSpec

  alias Trento.Abilities

  @endpoint TrentoWeb.Endpoint

  setup %{conn: conn} do
    delete_default_abilities()

    api_spec = ApiSpec.spec()

    {:ok, conn: put_req_header(conn, "accept", "application/json"), api_spec: api_spec}
  end

  describe "index" do
    test "lists all abilities", %{conn: conn, api_spec: api_spec} do
      [%{id: ability_id1}, %{id: ability_id2}] = insert_list(2, :ability)

      conn = get(conn, "/api/v1/abilities")

      resp =
        conn
        |> json_response(200)
        |> assert_schema("AbilityCollection", api_spec)

      assert [%{id: ^ability_id1}, %{id: ^ability_id2}] = resp
    end
  end

  defp delete_default_abilities do
    Trento.Repo.delete_all(Abilities.Ability)
  end
end
