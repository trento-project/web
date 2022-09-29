defmodule Trento.Domain.SapSystem.Instance do
  @moduledoc """
  This module represents a SAP System instance.
  """

  require Trento.Domain.Enums.Health, as: Health

  @required_fields []

  use Trento.Type

  deftype do
    field :sid, :string
    field :instance_number, :integer
    field :features, {:array, :string}
    field :host_id, :string
    field :health, Ecto.Enum, values: Health.values()
    field :system_replication, :string
    field :system_replication_status, :string
  end
end
