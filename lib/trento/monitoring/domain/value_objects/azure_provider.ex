defmodule Trento.Monitoring.Domain.AzureProvider do
  @moduledoc """
  Azure provider value object
  """

  use TypedStruct
  use Domo

  @derive Jason.Encoder
  typedstruct do
    @typedoc "AzureProvider value object"

    field :vm_name, String.t()
    field :resource_group, String.t()
    field :location, String.t()
    field :vm_size, String.t()
    field :data_disk_number, non_neg_integer()
    field :offer, String.t()
    field :sku, String.t()
  end
end
