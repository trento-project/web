defmodule Trento.Domain.AwsProvider do
  @moduledoc """
  AWS provider value object
  """

  @required_fields nil

  use Trento.Type

  deftype do
    field :account_id, :string
    field :ami_id, :string
    field :availability_zone, :string
    field :data_disk_number, :integer
    field :instance_id, :string
    field :instance_type, :string
    field :region, :string
    field :vpc_id, :string
  end
end
