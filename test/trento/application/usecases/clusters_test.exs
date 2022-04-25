defmodule Trento.ClustersTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use Trento.DataCase

  import Trento.Factory
  import Mock

  alias Trento.Clusters
  alias Trento.Domain.Commands.RequestChecksExecution

  describe "Connection Settings Management for the Hosts of a Cluster" do
    setup do
      cluster_id = Faker.UUID.v4()
      cluster_projection(id: cluster_id)

      %{
        cluster_id: cluster_id,
        hosts: [
          host_projection(hostname: "A-01", cluster_id: cluster_id),
          host_projection(hostname: "B-01", cluster_id: cluster_id)
        ]
      }
    end

    test "should retrieve connection settings for a given cluster", %{
      cluster_id: cluster_id,
      hosts: [
        %{id: a_host_id, hostname: a_hostname, cluster_id: cluster_id},
        %{id: another_host_id, hostname: another_hostname, cluster_id: cluster_id}
      ]
    } do
      settings = Clusters.get_hosts_connection_settings(cluster_id)

      assert [
               %{
                 host_id: ^a_host_id,
                 hostname: ^a_hostname,
                 default_user: "root",
                 user: nil
               },
               %{
                 host_id: ^another_host_id,
                 hostname: ^another_hostname,
                 default_user: "root",
                 user: nil
               }
             ] = settings
    end

    test "should retrieve default connection user for a specific cloud platform" do
      cluster_id = Faker.UUID.v4()
      cluster_projection(id: cluster_id)

      %{id: a_host_id, hostname: a_hostname} =
        host_projection(hostname: "A-01", cluster_id: cluster_id, provider: :azure)

      %{id: another_host_id, hostname: another_hostname} =
        host_projection(hostname: "B-01", cluster_id: cluster_id, provider: :azure)

      settings = Clusters.get_hosts_connection_settings(cluster_id)

      assert [
               %{
                 host_id: ^a_host_id,
                 hostname: ^a_hostname,
                 default_user: "cloudadmin",
                 user: nil
               },
               %{
                 host_id: ^another_host_id,
                 hostname: ^another_hostname,
                 default_user: "cloudadmin",
                 user: nil
               }
             ] = settings
    end

    test "should apply desired connection settings for the hosts of a given cluster", %{
      cluster_id: cluster_id,
      hosts: [
        %{id: a_host_id, hostname: a_hostname, cluster_id: cluster_id},
        %{id: another_host_id, hostname: another_hostname, cluster_id: cluster_id}
      ]
    } do
      connection_user = "luke"

      new_settings = [
        %{
          host_id: a_host_id,
          user: connection_user,
          default_user: "root"
        },
        %{
          host_id: another_host_id,
          user: connection_user,
          default_user: "root"
        }
      ]

      :ok = Clusters.save_hosts_connection_settings(new_settings)

      stored_settings = Clusters.get_hosts_connection_settings(cluster_id)

      assert [
               %{
                 host_id: ^a_host_id,
                 hostname: ^a_hostname,
                 user: ^connection_user
               },
               %{
                 host_id: ^another_host_id,
                 hostname: ^another_hostname,
                 user: ^connection_user
               }
             ] = stored_settings
    end
  end

  describe "checks execution" do
    test "should dispatch checks execution requests for each cluster" do
      # TODO: use Mox and beavhiours to test this
      with_mock Trento.Commanded, dispatch: fn _ -> :ok end do
        clusters = Enum.map(0..4, fn _ -> cluster_projection() end)

        :ok = Clusters.request_clusters_checks_execution()

        Enum.each(clusters, fn cluster ->
          assert_called Trento.Commanded.dispatch(%RequestChecksExecution{
                          cluster_id: cluster.id
                        })
        end)
      end
    end
  end
end
