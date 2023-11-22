defmodule Trento.SapSystems.Instance do
  @moduledoc """
  This module represents a SAP System instance.
  """

  require Trento.Domain.Enums.Health, as: Health

  @required_fields []

  use Trento.Support.Type

  deftype do
    field :sid, :string
    field :instance_number, :string
    field :features, :string
    field :host_id, Ecto.UUID
    field :health, Ecto.Enum, values: Health.values()
    field :system_replication, :string
    field :system_replication_status, :string
    field :absent_at, :utc_datetime_usec
  end
end
