defmodule Trento.EnrichRegisterClusterHostTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Support.Middleware.Enrichable

  alias Trento.ClusterReadModel
  alias Trento.Repo

  test "should update the cib_last_written field if the cluster exists" do
    %{id: cluster_id} = insert(:cluster)
    cib_last_written = Date.to_string(Faker.Date.forward(0))

    command =
      build(
        :register_cluster_host,
        cluster_id: cluster_id,
        cib_last_written: cib_last_written
      )

    Enrichable.enrich(command, %{})

    %ClusterReadModel{cib_last_written: ^cib_last_written} =
      Repo.get(ClusterReadModel, cluster_id)
  end
end
