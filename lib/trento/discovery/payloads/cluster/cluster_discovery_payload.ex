defmodule Trento.Discovery.Payloads.Cluster.ClusterDiscoveryPayload do
  @moduledoc """
  Cluster discovery integration event payload
  """
  @required_fields []
  @required_fields_offline [:id]
  @required_fields_online [:dc, :provider, :id, :cluster_type]
  @required_fields_hana [:hana_architecture_type]

  use Trento.Support.Type

  require Trento.Enums.Provider, as: Provider
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Clusters.Enums.ClusterHostStatus, as: ClusterHostStatus
  require Trento.Clusters.Enums.HanaArchitectureType, as: HanaArchitectureType

  alias Trento.Discovery.Payloads.Cluster.{
    CibDiscoveryPayload,
    CrmmonDiscoveryPayload,
    SbdDiscoveryPayload
  }

  deftype do
    field :dc, :boolean

    field :provider, Ecto.Enum,
      values: Provider.values(),
      default: Provider.unknown()

    field :id, :string
    field :name, :string
    field :cluster_type, Ecto.Enum, values: ClusterType.values()
    field :cluster_host_status, Ecto.Enum, values: ClusterHostStatus.values()
    field :hana_architecture_type, Ecto.Enum, values: HanaArchitectureType.values()

    embeds_one :cib, CibDiscoveryPayload
    embeds_one :sbd, SbdDiscoveryPayload
    embeds_one :crmmon, CrmmonDiscoveryPayload
  end

  def changeset(cluster, attrs) do
    if offline?(attrs) do
      changeset_offline(cluster, attrs)
    else
      changeset_online(cluster, attrs)
    end
  end

  defp offline?(%{"online" => false}), do: true
  defp offline?(_), do: false

  defp changeset_online(cluster, attrs) do
    glob_topology = parse_hana_glob_topology(attrs)

    hana_type = parse_hana_cluster_type(attrs)
    ascs_ers_type = parse_ascs_ers_cluster_type(attrs)

    enriched_attributes =
      enrich_cluster_and_hana_architecture_types(
        attrs,
        hana_type,
        ascs_ers_type,
        glob_topology
      )

    cluster
    |> cast(enriched_attributes, fields())
    |> cast_embed(:cib, required: true)
    |> cast_embed(:sbd)
    |> cast_embed(:crmmon, required: true)
    |> validate_required_fields(@required_fields_online)
    |> maybe_validate_required_fields(enriched_attributes)
    |> put_change(:cluster_host_status, ClusterHostStatus.online())
  end

  defp changeset_offline(cluster, attrs) do
    cluster
    |> cast(attrs, [:id, :name])
    |> validate_required_fields(@required_fields_offline)
    |> put_change(:cluster_host_status, ClusterHostStatus.offline())
  end

  defp parse_hana_glob_topology(%{
         "cib" => %{
           "configuration" => %{"crm_config" => %{"cluster_properties" => cluster_properties}}
         }
       }) do
    Enum.find_value(cluster_properties, nil, fn
      %{"name" => name, "value" => value} ->
        if String.ends_with?(name, "_glob_topology"), do: value

      _ ->
        nil
    end)
  end

  # The cluster manages a HANA system when it manages a SAPHanaTopology resource
  # and other SAPHana for Scale up or SAPHanaController for Scale Out.
  defp parse_hana_cluster_type(%{"crmmon" => %{"clones" => clones}}) when not is_nil(clones) do
    all_clone_resources =
      Enum.flat_map(clones, fn
        %{"resources" => nil} -> []
        %{"resources" => resources} -> resources
      end)

    has_sap_hana_topology =
      Enum.any?(all_clone_resources, fn %{"agent" => agent} ->
        agent == "ocf::suse:SAPHanaTopology"
      end)

    has_sap_hana =
      Enum.any?(all_clone_resources, fn %{"agent" => agent} -> agent == "ocf::suse:SAPHana" end)

    has_sap_hana_controller =
      Enum.any?(all_clone_resources, fn %{"agent" => agent} ->
        agent == "ocf::suse:SAPHanaController"
      end)

    do_detect_cluster_type(has_sap_hana_topology, has_sap_hana, has_sap_hana_controller)
  end

  defp parse_hana_cluster_type(_), do: ClusterType.unknown()

  # The cluster manages a ASCS/ERS system when it manages an even number of
  # SAPInstance resources that are not managing HANA (HDB) databases.
  defp parse_ascs_ers_cluster_type(%{"crmmon" => %{"groups" => groups}})
       when not is_nil(groups) do
    sap_instance_count =
      Enum.count(groups, fn %{"resources" => resources} ->
        Enum.any?(resources, fn %{"id" => id, "agent" => agent} ->
          agent == "ocf::heartbeat:SAPInstance" && not String.contains?(id, "HDB")
        end)
      end)

    do_detect_cluster_type(sap_instance_count)
  end

  defp parse_ascs_ers_cluster_type(_), do: ClusterType.unknown()

  defp do_detect_cluster_type(true, true, _), do: ClusterType.hana_scale_up()
  defp do_detect_cluster_type(true, _, true), do: ClusterType.hana_scale_out()
  defp do_detect_cluster_type(_, _, _), do: ClusterType.unknown()

  defp do_detect_cluster_type(count) when count >= 2 and rem(count, 2) == 0,
    do: ClusterType.ascs_ers()

  defp do_detect_cluster_type(_), do: ClusterType.unknown()

  defp enrich_cluster_and_hana_architecture_types(
         attrs,
         _,
         ClusterType.unknown(),
         "ScaleUp"
       ) do
    attrs
    |> Map.put("cluster_type", ClusterType.hana_scale_up())
    |> Map.put("hana_architecture_type", HanaArchitectureType.angi())
  end

  defp enrich_cluster_and_hana_architecture_types(
         attrs,
         _,
         ClusterType.unknown(),
         "ScaleOut"
       ) do
    attrs
    |> Map.put("cluster_type", ClusterType.hana_scale_out())
    |> Map.put("hana_architecture_type", HanaArchitectureType.angi())
  end

  defp enrich_cluster_and_hana_architecture_types(attrs, hana_type, ClusterType.unknown(), _)
       when hana_type in [ClusterType.hana_scale_up(), ClusterType.hana_scale_out()] do
    attrs
    |> Map.put("cluster_type", hana_type)
    |> Map.put("hana_architecture_type", HanaArchitectureType.classic())
  end

  defp enrich_cluster_and_hana_architecture_types(
         attrs,
         ClusterType.unknown(),
         ClusterType.ascs_ers(),
         _
       ) do
    Map.put(attrs, "cluster_type", ClusterType.ascs_ers())
  end

  defp enrich_cluster_and_hana_architecture_types(attrs, hana_type, ClusterType.ascs_ers(), _)
       when hana_type in [ClusterType.hana_scale_up(), ClusterType.hana_scale_out()] do
    Map.put(attrs, "cluster_type", ClusterType.hana_ascs_ers())
  end

  defp enrich_cluster_and_hana_architecture_types(attrs, _, _, _) do
    Map.put(attrs, "cluster_type", ClusterType.unknown())
  end

  defp maybe_validate_required_fields(cluster, %{"cluster_type" => ClusterType.hana_scale_up()}),
    do: validate_required(cluster, @required_fields_hana)

  defp maybe_validate_required_fields(cluster, %{"cluster_type" => ClusterType.hana_scale_out()}),
    do: validate_required(cluster, @required_fields_hana)

  defp maybe_validate_required_fields(cluster, _),
    do: cluster
end
