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
        |> Enum.map(fn _ -> insert(:cluster) end)
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

  describe "Connection Settings Management for the Hosts of a Cluster" do
    setup do
      cluster_id = Faker.UUID.v4()
      insert(:cluster, id: cluster_id)

      %{
        cluster_id: cluster_id,
        hosts: [
          insert(:host, hostname: "A-01", cluster_id: cluster_id),
          insert(:host, hostname: "B-01", cluster_id: cluster_id)
        ]
      }
    end

    test "should retrieve connection settings for a given cluster", %{
      conn: conn,
      cluster_id: cluster_id,
      hosts: [
        %{id: a_host_id, cluster_id: cluster_id},
        %{id: another_host_id, cluster_id: cluster_id}
      ]
    } do
      resp =
        conn
        |> get(Routes.cluster_path(conn, :get_connection_settings, cluster_id))
        |> json_response(200)

      assert [
               %{
                 "default_user" => "root",
                 "host_id" => ^a_host_id,
                 "user" => nil
               },
               %{
                 "default_user" => "root",
                 "host_id" => ^another_host_id,
                 "user" => nil
               }
             ] = resp
    end

    test "should apply desired connection settings for the hosts of a given cluster", %{
      conn: conn,
      cluster_id: cluster_id,
      hosts: [
        %{id: a_host_id, cluster_id: cluster_id},
        %{id: another_host_id, cluster_id: cluster_id}
      ]
    } do
      connection_user = "cloudadmin"

      resp =
        conn
        |> put(
          Routes.cluster_path(conn, :save_connection_settings, cluster_id),
          %{
            "settings" => [
              %{
                "host_id" => a_host_id,
                "user" => connection_user
              },
              %{
                "host_id" => another_host_id,
                "user" => connection_user
              }
            ]
          }
        )
        |> json_response(200)

      assert [
               %{
                 "host_id" => ^a_host_id,
                 "user" => ^connection_user
               },
               %{
                 "host_id" => ^another_host_id,
                 "user" => ^connection_user
               }
             ] = resp
    end
  end
end
