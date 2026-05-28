# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.Events.ClusterRolledUp do
  @moduledoc """
  This event is emitted when a cluster is rolled up and its stream is archived.
  It contains the snapshot of the cluster aggregate that will be used to restore the aggregate state.
  """

  use Trento.Support.Event

  alias Trento.Clusters.Cluster

  defevent resource: "cluster", version: 2 do
    field :cluster_id, Ecto.UUID
    embeds_one :snapshot, Cluster
  end

  # Handle old ClusterRolledUp, inherited from the previous aggregate when
  # discovered_health field existed.
  # - discovered_health is moved to replication_health for HANA clusters
  # - discovered_health is moved to distributed_health for ASCS/ERS clusters
  def upcast(
        %{
          "snapshot" =>
            %{
              "type" => type,
              "discovered_health" => discovered_health
            } = snapshot
        } = params,
        _,
        2
      )
      when type in ["hana_scale_up", "hana_scale_out"] do
    new_snapshot =
      snapshot
      |> Map.put("health_details", %{"replication_health" => discovered_health})
      |> Map.drop("discovered_health")

    Map.put(params, "snapshot", new_snapshot)
  end

  def upcast(
        %{
          "snapshot" =>
            %{
              "type" => "ascs_ers",
              "discovered_health" => discovered_health
            } = snapshot
        } = params,
        _,
        2
      ) do
    new_snapshot =
      snapshot
      |> Map.put("health_details", %{"distributed_health" => discovered_health})
      |> Map.drop("discovered_health")

    Map.put(params, "snapshot", new_snapshot)
  end

  def upcast(params, _, 2),
    do:
      params
      |> Map.put("replication_health", :unknown)
      |> Map.put("distributed_health", :unknown)
      |> Map.drop("discovered_health")
end
