defmodule Trento.ClustersTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use Trento.DataCase

  import Mox

  import Trento.Factory

  alias Trento.Clusters

  alias Trento.ClusterEnrichmentData
  alias Trento.ClusterReadModel

  setup [:set_mox_from_context, :verify_on_exit!]

  describe "checks execution with wanda adapter" do
    test "should start a checks execution on demand if checks are selected" do
      %{id: cluster_id} = insert(:cluster)
      insert(:host, deregistered_at: DateTime.utc_now(), cluster_id: cluster_id)
      insert_list(2, :host, cluster_id: cluster_id)

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn "executions", message ->
        assert message.group_id == cluster_id
        assert length(message.targets) == 2
        :ok
      end)

      assert :ok = Clusters.request_checks_execution(cluster_id)
    end

    test "should not start checks execution if the cluster is not registered" do
      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 0, fn _, _ ->
        :ok
      end)

      assert {:error, :not_found} = Clusters.request_checks_execution(UUID.uuid4())
    end

    test "should not start checks execution if no checks are selected" do
      %{id: cluster_id} = insert(:cluster, selected_checks: [])

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 0, fn _, _ ->
        :ok
      end)

      assert :ok = Clusters.request_checks_execution(cluster_id)
    end

    test "should return an error if the checks execution start fails" do
      %{id: cluster_id} = insert(:cluster)

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn _, _ ->
        {:error, :amqp_error}
      end)

      assert {:error, :amqp_error} = Clusters.request_checks_execution(cluster_id)
    end
  end

  describe "get clusters" do
    test "should not return soft deleted clusters" do
      cib_last_written = Date.to_string(Faker.Date.forward(0))
      cluster_id = Faker.UUID.v4()

      insert(:cluster, id: cluster_id)
      insert(:cluster, deregistered_at: DateTime.utc_now())
      insert(:cluster_enrichment_data, cluster_id: cluster_id)

      [%ClusterReadModel{id: ^cluster_id, cib_last_written: ^cib_last_written}] =
        Clusters.get_all_clusters()
    end

    test "should return enriched clusters" do
      cib_last_written = Date.to_string(Faker.Date.forward(0))
      cluster_id = Faker.UUID.v4()

      insert(:cluster, id: cluster_id)
      insert(:cluster_enrichment_data, cluster_id: cluster_id)

      [%ClusterReadModel{id: ^cluster_id, cib_last_written: ^cib_last_written}] =
        Clusters.get_all_clusters()
    end
  end

  describe "update cib_last_written" do
    test "should create a new enriched cluster entry" do
      cib_last_written = Date.to_string(Faker.Date.forward(0))
      cluster_id = Faker.UUID.v4()

      {:ok, %ClusterEnrichmentData{cluster_id: ^cluster_id, cib_last_written: ^cib_last_written}} =
        Clusters.update_cib_last_written(cluster_id, cib_last_written)
    end

    test "should update cib_last_written field properly" do
      cluster = insert(:cluster)
      cib_last_written = Date.to_string(Faker.Date.forward(0))

      {:ok, %ClusterEnrichmentData{cib_last_written: ^cib_last_written}} =
        Clusters.update_cib_last_written(cluster.id, cib_last_written)
    end
  end
end
