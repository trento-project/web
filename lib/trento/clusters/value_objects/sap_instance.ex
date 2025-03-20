defmodule Trento.Clusters.ValueObjects.SapInstance do
  @moduledoc """
  Clustered SAP instance
  """
  @required_fields [:name, :sid, :instance_number, :resource_type]

  use Trento.Support.Type

  require Trento.Clusters.Enums.SapInstanceResourceType, as: SapInstanceResourceType

  deftype do
    field :name, :string
    field :sid, :string
    field :instance_number, :string
    field :hostname, :string
    field :resource_type, Ecto.Enum, values: SapInstanceResourceType.values()
  end

  @spec get_hana_instance_sid([__MODULE__.t()]) :: String.t() | nil
  def get_hana_instance_sid(sap_instances) do
    Enum.find_value(sap_instances, nil, fn %{resource_type: resource_type, sid: sid} ->
      if resource_type == SapInstanceResourceType.sap_hana_topology() do
        sid
      else
        nil
      end
    end)
  end

  @spec get_sap_instance_sids([__MODULE__.t()]) :: [String.t()]
  def get_sap_instance_sids(sap_instances) do
    sap_instances
    |> Enum.filter(fn %{resource_type: resource_type} ->
      resource_type == SapInstanceResourceType.sap_instance()
    end)
    |> Enum.map(fn %{sid: sid} -> sid end)
    |> Enum.uniq()
  end
end
