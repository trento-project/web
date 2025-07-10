defmodule Trento.SapSystems.Instance do
  @moduledoc """
  This module represents a SAP System instance.
  """

  require Trento.Enums.Health, as: Health

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
    field :system_replication_site, :string
    field :system_replication_mode, :string
    field :system_replication_operation_mode, :string
    field :system_replication_source_site, :string
    field :system_replication_tier, :integer
    field :absent_at, :utc_datetime_usec
  end
end
