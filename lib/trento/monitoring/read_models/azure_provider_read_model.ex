defmodule Trento.Monitoring.AzureProviderReadModel do
  @moduledoc """
  Azure provider read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__struct__]}
  @primary_key false

  embedded_schema do
    field :vm_name, :string
    field :resource_group, :string
    field :location, :string
    field :vm_size, :string
    field :data_disk_number, :integer
    field :offer, :string
    field :sku, :string
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(azure_data, attrs) do
    cast(azure_data, attrs, __MODULE__.__schema__(:fields))
  end
end
