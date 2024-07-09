defmodule Trento.Discovery.Payloads.Cluster.ClusterDiscoveryPayload do
  @moduledoc """
  Cluster discovery integration event payload
  """

  @required_fields [:dc, :provider, :id, :cluster_type]
  @required_fields_hana [:sid, :hana_architecture_type]
  @required_fields_ascs_ers [:additional_sids]

  use Trento.Support.Type

  require Trento.Enums.Provider, as: Provider
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
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
    field :hana_architecture_type, Ecto.Enum, values: HanaArchitectureType.values()
    field :sid, :string
    field :additional_sids, {:array, :string}

    embeds_one :cib, CibDiscoveryPayload
    embeds_one :sbd, SbdDiscoveryPayload
    embeds_one :crmmon, CrmmonDiscoveryPayload
  end

  def changeset(cluster, attrs) do
    glob_topology = parse_hana_glob_topology(attrs)

    enriched_attributes =
      attrs
      |> enrich_cluster_and_hana_architecture_types(glob_topology)
      |> enrich_cluster_sid

    cluster
    |> cast(enriched_attributes, fields())
    |> cast_embed(:cib, required: true)
    |> cast_embed(:sbd)
    |> cast_embed(:crmmon, required: true)
    |> validate_required_fields(@required_fields)
    |> maybe_validate_required_fields(enriched_attributes)
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

  defp enrich_cluster_and_hana_architecture_types(attrs, "ScaleUp") do
    attrs
    |> Map.put("cluster_type", ClusterType.hana_scale_up())
    |> Map.put("hana_architecture_type", HanaArchitectureType.angi())
  end

  defp enrich_cluster_and_hana_architecture_types(attrs, "ScaleOut") do
    attrs
    |> Map.put("cluster_type", ClusterType.hana_scale_out())
    |> Map.put("hana_architecture_type", HanaArchitectureType.angi())
  end

  defp enrich_cluster_and_hana_architecture_types(attrs, nil) do
    attrs
    |> Map.put("cluster_type", parse_cluster_type(attrs))
    |> put_hana_architecture
  end

  defp parse_cluster_type(%{"crmmon" => %{"clones" => nil, "groups" => nil}}),
    do: ClusterType.unknown()

  defp parse_cluster_type(%{"crmmon" => %{"clones" => nil, "groups" => groups}}) do
    sap_instance_count =
      Enum.count(groups, fn %{"resources" => resources} ->
        Enum.any?(resources, fn %{"agent" => agent} ->
          agent == "ocf::heartbeat:SAPInstance"
        end)
      end)

    do_detect_cluster_type(sap_instance_count)
  end

  defp parse_cluster_type(%{"crmmon" => %{"clones" => clones}}) do
    has_sap_hana_topology =
      Enum.any?(clones, fn %{"resources" => resources} ->
        Enum.any?(resources, fn %{"agent" => agent} -> agent == "ocf::suse:SAPHanaTopology" end)
      end)

    has_sap_hana =
      Enum.any?(clones, fn %{"resources" => resources} ->
        Enum.any?(resources, fn %{"agent" => agent} -> agent == "ocf::suse:SAPHana" end)
      end)

    has_sap_hana_controller =
      Enum.any?(clones, fn %{"resources" => resources} ->
        Enum.any?(resources, fn %{"agent" => agent} ->
          agent == "ocf::suse:SAPHanaController"
        end)
      end)

    do_detect_cluster_type(has_sap_hana_topology, has_sap_hana, has_sap_hana_controller)
  end

  defp parse_cluster_type(_), do: ClusterType.unknown()

  defp do_detect_cluster_type(true, true, _), do: ClusterType.hana_scale_up()
  defp do_detect_cluster_type(true, _, true), do: ClusterType.hana_scale_out()
  defp do_detect_cluster_type(_, _, _), do: ClusterType.unknown()

  defp do_detect_cluster_type(count) when count >= 2 and rem(count, 2) == 0,
    do: ClusterType.ascs_ers()

  defp do_detect_cluster_type(_), do: ClusterType.unknown()

  defp put_hana_architecture(%{"cluster_type" => type} = attrs)
       when type in [ClusterType.hana_scale_up(), ClusterType.hana_scale_out()],
       do: Map.put(attrs, "hana_architecture_type", HanaArchitectureType.classic())

  defp put_hana_architecture(attrs), do: attrs

  defp enrich_cluster_sid(%{"cluster_type" => ClusterType.unknown()} = attrs) do
    attrs
    |> Map.put("sid", nil)
    |> Map.put("additional_sids", [])
  end

  defp enrich_cluster_sid(attrs) do
    attrs
    |> Map.put("sid", parse_cluster_sid(attrs))
    |> Map.put("additional_sids", parse_cluster_additional_sids(attrs))
  end

  defp parse_cluster_sid(%{
         "cib" => %{"configuration" => %{"resources" => %{"clones" => nil}}}
       }),
       do: nil

  defp parse_cluster_sid(%{
         "cib" => %{"configuration" => %{"resources" => %{"clones" => clones}}}
       }) do
    clones
    |> Enum.find_value([], fn
      %{"primitive" => %{"type" => "SAPHanaTopology", "instance_attributes" => attributes}} ->
        attributes

      _ ->
        nil
    end)
    |> Enum.find_value(nil, fn
      %{"name" => "SID", "value" => value} when value != "" ->
        value

      _ ->
        nil
    end)
  end

  defp parse_cluster_additional_sids(%{
         "cib" => %{"configuration" => %{"resources" => %{"clones" => nil, "groups" => groups}}}
       }) do
    groups
    |> Enum.flat_map(fn
      %{"primitives" => primitives} -> primitives
    end)
    |> Enum.flat_map(fn
      %{"type" => "SAPInstance", "instance_attributes" => attributes} ->
        attributes

      _ ->
        []
    end)
    |> Enum.flat_map(fn
      %{"name" => "InstanceName", "value" => value} when value != "" ->
        value |> String.split("_") |> Enum.at(0) |> List.wrap()

      _ ->
        []
    end)
    |> Enum.uniq()
  end

  defp parse_cluster_additional_sids(_), do: []

  defp maybe_validate_required_fields(cluster, %{"cluster_type" => ClusterType.hana_scale_up()}),
    do: validate_required(cluster, @required_fields_hana)

  defp maybe_validate_required_fields(cluster, %{"cluster_type" => ClusterType.hana_scale_out()}),
    do: validate_required(cluster, @required_fields_hana)

  defp maybe_validate_required_fields(cluster, %{"cluster_type" => ClusterType.ascs_ers()}),
    do: validate_required(cluster, @required_fields_ascs_ers)

  defp maybe_validate_required_fields(cluster, _),
    do: cluster
end
