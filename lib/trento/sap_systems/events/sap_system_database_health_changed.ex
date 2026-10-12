# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.SapSystems.Events.SapSystemDatabaseHealthChanged do
  @moduledoc """
  This event is emitted when the SAP System database health has changed.
  """

  use Trento.Support.Event

  require Trento.Enums.Health, as: Health

  defevent do
    field :sap_system_id, Ecto.UUID
    field :database_health, Ecto.Enum, values: Health.values()
  end
end
