defmodule Trento.EnrichRegisterClusterHostTest do
  use ExUnit.Case
  use Trento.DataCase

  import Phoenix.ChannelTest
  import TrentoWeb.ChannelCase

  import Trento.Factory

  alias Trento.Support.Middleware.Enrichable

  alias Trento.ClusterEnrichmentData
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
end
