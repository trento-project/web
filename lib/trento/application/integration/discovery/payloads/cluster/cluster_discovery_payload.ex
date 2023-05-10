defmodule Trento.Integration.Discovery.ClusterDiscoveryPayload do
  @moduledoc """
  Cluster discovery integration event payload
  """

  @required_fields [:dc, :provider, :id, :cluster_type, :cib, :sbd, :crmmon]
  @required_fields_hana [:sid]
  @required_fields_ascs_ers [:additional_sids]

  use Trento.Type

  require Trento.Domain.Enums.Provider, as: Provider
  require Trento.Domain.Enums.ClusterType, as: ClusterType

  alias Trento.Integration.Discovery.ClusterDiscoveryPayload.{
    Cib,
    Crmmon,
    Sbd
  }

  deftype do
    field :dc, :boolean

    field :provider, Ecto.Enum,
      values: Provider.values(),
      default: Provider.unknown()

    field :id, :string
    field :name, :string
    field :cluster_type, Ecto.Enum, values: ClusterType.values()
    field :sid, :string
    field :additional_sids, {:array, :string}

    embeds_one :cib, Cib
    embeds_one :sbd, Sbd
    embeds_one :crmmon, Crmmon
  end

  def changeset(cluster, attrs) do
    enriched_attributes =
      attrs
      |> enrich_cluster_type
      |> enrich_cluster_sid

    cluster
    |> cast(enriched_attributes, fields())
    |> cast_embed(:cib)
    |> cast_embed(:sbd)
    |> cast_embed(:crmmon)
    |> validate_required_fields(@required_fields)
    |> maybe_validate_required_fields(enriched_attributes)
  end

  defp enrich_cluster_type(attrs),
    do: Map.put(attrs, "cluster_type", parse_cluster_type(attrs))

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
