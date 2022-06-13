defmodule Trento.Domain.GcpProvider do
  @moduledoc """
  Gcp provider value object
  """

  @required_fields nil

  use Trento.Type

  deftype do
    field :disk_number, :integer
    field :image, :string
    field :instance_name, :string
    field :machine_type, :string
    field :network, :string
    field :project_id, :string
    field :zone, :string
  end
end
