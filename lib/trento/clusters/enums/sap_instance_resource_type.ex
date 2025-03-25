defmodule Trento.Clusters.Enums.SapInstanceResourceType do
  @moduledoc """
  Type that represents the discovered type of a clustered SAP instance.
  """

  use Trento.Support.Enum, values: [:sap_hana_topology, :sap_instance]
end
