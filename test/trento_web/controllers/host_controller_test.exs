defmodule TrentoWeb.HostControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  describe "list" do
    test "should list all hosts", %{conn: conn} do
      [
        %{id: host_id_1, hostname: host_name_1},
        %{id: host_id_2, hostname: host_name_2},
        %{id: host_id_3, hostname: host_name_3}
      ] =
        0..2
        |> Enum.map(fn _ -> host_projection() end)
        |> Enum.sort_by(& &1.hostname)

      conn = get(conn, Routes.host_path(conn, :list))

      assert [
               %{
                 "id" => ^host_id_1,
                 "hostname" => ^host_name_1
               },
               %{
                 "id" => ^host_id_2,
                 "hostname" => ^host_name_2
               },
               %{
                 "id" => ^host_id_3,
                 "hostname" => ^host_name_3
               }
             ] = json_response(conn, 200)
    end
  end
end
