defmodule Trento.SapSystems.Events.SapSystemRegistered do
  @moduledoc """
  This event is emitted when a sap system is registered.
  """

  use Trento.Support.Event

  require Trento.SapSystems.Enums.EnsaVersion, as: EnsaVersion
  require Trento.Enums.Health, as: Health

  defevent do
    field :sap_system_id, Ecto.UUID
    field :sid, :string
    field :tenant, :string
    field :db_host, :string
    field :database_id, Ecto.UUID
    field :health, Ecto.Enum, values: Health.values()
    field :ensa_version, Ecto.Enum, values: EnsaVersion.values(), default: EnsaVersion.no_ensa()
  end
end
