# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Events.SapSystemRestored do
  @moduledoc """
  This event is emitted when a sap system is restored.
  """

  use Trento.Support.Event

  require Trento.Enums.Health, as: Health

  defevent do
    field :sap_system_id, Ecto.UUID
    field :tenant, :string
    field :db_host, :string
    field :health, Ecto.Enum, values: Health.values()
    field :database_health, Ecto.Enum, values: Health.values()
  end
end
