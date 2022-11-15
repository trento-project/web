defmodule Trento.HostsTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Hosts
  alias Trento.Repo

  alias Trento.SlesSubscriptionReadModel

  @moduletag :integration

  describe "SLES Subscriptions" do
    test "No SLES4SAP Subscriptions detected" do
      assert 0 = SlesSubscriptionReadModel |> Repo.all() |> length()
      assert 0 = Hosts.get_all_sles_subscriptions()
    end

    test "Detects the correct number of SLES4SAP Subscriptions" do
      insert_list(6, :sles_subscription, identifier: "SLES_SAP")
      insert_list(6, :sles_subscription, identifier: "sle-module-server-applications")

      assert 12 = SlesSubscriptionReadModel |> Repo.all() |> length()
      assert 6 = Hosts.get_all_sles_subscriptions()
    end
  end

  describe "Connection settings" do
    test "Returns connection settings map" do
      host_id = Faker.UUID.v4()
      host = insert(:host, id: host_id, ssh_address: "192.168.1.1")

      insert(:host_connection_settings, id: host_id, user: "root")

      assert %{
               host_id: host_id,
               ssh_address: "192.168.1.1",
               user: "root",
               default_user: "root",
               hostname: host.hostname
             } ==
               Hosts.get_connection_settings(host_id)
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
      cluster_id: cluster_id,
      hosts: [
        %{id: a_host_id, hostname: a_hostname, cluster_id: cluster_id},
        %{id: another_host_id, hostname: another_hostname, cluster_id: cluster_id}
      ]
    } do
      settings = Hosts.get_all_connection_settings_by_cluster_id(cluster_id)

      assert [
               %{
                 host_id: ^a_host_id,
                 hostname: ^a_hostname,
                 user: nil
               },
               %{
                 host_id: ^another_host_id,
                 hostname: ^another_hostname,
                 user: nil
               }
             ] = settings
    end

    test "should retrieve default connection user for a specific cloud platform" do
      cluster_id = Faker.UUID.v4()
      insert(:cluster, id: cluster_id)

      %{id: a_host_id, hostname: a_hostname} =
        insert(
          :host,
          hostname: "A-01",
          cluster_id: cluster_id,
          provider: :azure,
          provider_data: %{admin_username: "adminuser123"}
        )

      %{id: another_host_id, hostname: another_hostname} =
        insert(
          :host,
          hostname: "B-01",
          cluster_id: cluster_id,
          provider: :azure,
          provider_data: %{admin_username: "adminuser345"}
        )

      settings = Hosts.get_all_connection_settings_by_cluster_id(cluster_id)

      assert [
               %{
                 host_id: ^a_host_id,
                 hostname: ^a_hostname,
                 user: nil
               },
               %{
                 host_id: ^another_host_id,
                 hostname: ^another_hostname,
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

      :ok = Hosts.save_hosts_connection_settings(new_settings)

      stored_settings = Hosts.get_all_connection_settings_by_cluster_id(cluster_id)

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
end
