defmodule Trento.SapSystems.Events.SapSystemUpdated do
  @moduledoc """
  This event is emitted when some of the fields in the SAP system are updated
  """

  require Trento.Domain.Enums.EnsaVersion, as: EnsaVersion

  use Trento.Support.Event

  defevent do
    field :sap_system_id, Ecto.UUID
    field :ensa_version, Ecto.Enum, values: EnsaVersion.values()
  end
end
