defmodule Trento.HostsTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Hosts
  alias Trento.Repo

  alias Trento.{
    AzureProviderReadModel,
    SlesSubscriptionReadModel
  }

  @moduletag :integration

  describe "SLES Subscriptions" do
    test "No SLES4SAP Subscriptions detected" do
      assert 0 = Repo.all(SlesSubscriptionReadModel) |> length
      assert 0 = Hosts.get_all_sles_subscriptions()
    end

    test "Detects the correct number of SLES4SAP Subscriptions" do
      0..5
      |> Enum.map(fn _ ->
        subscription_projection(identifier: "SLES_SAP")
        subscription_projection(identifier: "sle-module-server-applications")
      end)

      assert 12 = SlesSubscriptionReadModel |> Repo.all() |> length()
      assert 6 = Hosts.get_all_sles_subscriptions()
    end
  end

  describe "Connection settings" do
    test "Returns connection settings map" do
      host_id = Faker.UUID.v4()
      host = host_projection(id: host_id, ssh_address: "192.168.1.1")

      host_connection_settings_projection(id: host_id, user: "root")

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
      settings = Hosts.get_all_connection_settings_by_cluster_id(cluster_id)

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
        host_projection(
          hostname: "A-01",
          cluster_id: cluster_id,
          provider: :azure,
          provider_data: %AzureProviderReadModel{admin_username: "adminuser123"}
        )

      %{id: another_host_id, hostname: another_hostname} =
        host_projection(
          hostname: "B-01",
          cluster_id: cluster_id,
          provider: :azure,
          provider_data: %AzureProviderReadModel{admin_username: "adminuser345"}
        )

      settings = Hosts.get_all_connection_settings_by_cluster_id(cluster_id)

      assert [
               %{
                 host_id: ^a_host_id,
                 hostname: ^a_hostname,
                 default_user: "adminuser123",
                 user: nil
               },
               %{
                 host_id: ^another_host_id,
                 hostname: ^another_hostname,
                 default_user: "adminuser345",
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
