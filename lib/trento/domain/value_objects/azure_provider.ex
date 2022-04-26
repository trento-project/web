defmodule Trento.Domain.AzureProvider do
  @moduledoc """
  Azure provider value object
  """

  @required_fields nil

  use Trento.Type

  deftype do
    field :vm_name, :string
    field :resource_group, :string
    field :location, :string
    field :vm_size, :string
    field :data_disk_number, :integer
    field :offer, :string
    field :sku, :string
    field :admin_username, :string
  end
end
