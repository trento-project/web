defmodule TrentoWeb.ClusterControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  describe "list" do
    test "should list all clusters", %{conn: conn} do
      [
        %{id: cluster_id_1, name: cluster_name_1},
        %{id: cluster_id_2, name: cluster_name_2},
        %{id: cluster_id_3, name: cluster_name_3}
      ] =
        0..2
        |> Enum.map(fn _ -> cluster_projection() end)
        |> Enum.sort_by(& &1.name)

      conn = get(conn, Routes.cluster_path(conn, :list))

      assert [
               %{
                 "id" => ^cluster_id_1,
                 "name" => ^cluster_name_1
               },
               %{
                 "id" => ^cluster_id_2,
                 "name" => ^cluster_name_2
               },
               %{
                 "id" => ^cluster_id_3,
                 "name" => ^cluster_name_3
               }
             ] = json_response(conn, 200)
    end
  end
end
