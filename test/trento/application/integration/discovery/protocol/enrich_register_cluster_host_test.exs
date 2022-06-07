defmodule Trento.EnrichRegisterClusterHostTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Support.Middleware.Enrichable

  alias Trento.EnrichedCluster
  alias Trento.Repo

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

    %EnrichedCluster{cib_last_written: ^cib_last_written} = Repo.get(EnrichedCluster, cluster_id)
  end
end
