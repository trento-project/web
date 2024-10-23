defmodule Trento.Infrastructure.Commanded.Middleware.EnrichRegisterClusterHostTest do
  use ExUnit.Case
  use Trento.DataCase

  import Phoenix.ChannelTest
  import TrentoWeb.ChannelCase

  import Trento.Factory

  alias Trento.Infrastructure.Commanded.Middleware.Enrichable

  alias Trento.Clusters.Commands.RegisterClusterHost

  alias Trento.Clusters.ValueObjects.{
    HanaClusterDetails,
    HanaClusterNode
  }

  alias Trento.Clusters.ClusterEnrichmentData
  alias Trento.Repo

  @endpoint TrentoWeb.Endpoint

  setup do
    {:ok, _, socket} =
      TrentoWeb.UserSocket
      |> socket("user_id", %{some: :assign})
      |> subscribe_and_join(TrentoWeb.MonitoringChannel, "monitoring:clusters")

    %{socket: socket}
  end

  test "should create a new enriched cluster entry on register_cluster_host command" do
    %{id: cluster_id} = insert(:cluster)
    cib_last_written = Date.to_string(Faker.Date.forward(0))

    command =
      build(
        :register_cluster_host,
        cluster_id: cluster_id,
        cib_last_written: cib_last_written
      )

    Enrichable.enrich(command, %{})

    %ClusterEnrichmentData{cib_last_written: ^cib_last_written} =
      Repo.get(ClusterEnrichmentData, cluster_id)

    assert_broadcast "cluster_cib_last_written_updated",
                     %{cluster_id: ^cluster_id, cib_last_written: ^cib_last_written},
                     1000
  end

  describe "stripping irrelevant cluster node attributes" do
    test "should strip irrelevant lpt attributes from hana-scale-up cluster nodes" do
      sid = String.upcase(Faker.Lorem.word())
      lpa_attribute = "lpa_#{String.downcase(sid)}_lpt"

      %{name: first_node_name} =
        node1 =
        build(:hana_cluster_node,
          attributes: %{lpa_attribute => "17465345", "relevant" => "foo"}
        )

      %{name: second_node_name} =
        node2 =
        build(:hana_cluster_node,
          attributes: %{lpa_attribute => "30", "another_relevant" => "bar"}
        )

      initial_details =
        build(:hana_cluster_details,
          nodes: [
            node1,
            node2
          ]
        )

      %{cluster_id: cluster_id} =
        initial_command =
        build(
          :register_cluster_host,
          details: initial_details,
          type: :hana_scale_up,
          sid: sid
        )

      assert {:ok, enriched_command} = Enrichable.enrich(initial_command, %{})

      expected_enriched_command = %RegisterClusterHost{
        initial_command
        | details: %HanaClusterDetails{
            initial_details
            | nodes: [
                %HanaClusterNode{
                  node1
                  | attributes: %{"relevant" => "foo"}
                },
                %HanaClusterNode{
                  node2
                  | attributes: %{"another_relevant" => "bar"}
                }
              ]
          }
      }

      assert expected_enriched_command == enriched_command

      assert %ClusterEnrichmentData{
               nodes_attributes: %{
                 ^first_node_name => %{^lpa_attribute => "17465345"},
                 ^second_node_name => %{^lpa_attribute => "30"}
               }
             } = Repo.get(ClusterEnrichmentData, cluster_id)
    end

    test "should not strip attributes from non hana-scale-up cluster nodes" do
      initial_details =
        build(:hana_cluster_details,
          nodes: [
            build(:hana_cluster_node,
              attributes: %{"lpa_FOO_lpt" => "initial-timestamp", "relevant" => "foo"}
            ),
            build(:hana_cluster_node,
              attributes: %{"lpa_BAR_lpt" => "30", "another_relevant" => "bar"}
            )
          ]
        )

      %{cluster_id: cluster_id} =
        initial_command =
        build(
          :register_cluster_host,
          details: initial_details,
          type: :hana_scale_out
        )

      assert {:ok, ^initial_command} = Enrichable.enrich(initial_command, %{})

      assert %ClusterEnrichmentData{
               nodes_attributes: %{}
             } = Repo.get(ClusterEnrichmentData, cluster_id)
    end
  end
end
