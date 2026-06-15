# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Events.ApplicationInstanceHealthChanged do
  @moduledoc """
  This event is emitted when a application instance health has changed.

  This event is deprecated.
  """

  use Trento.Support.Event

  require Trento.Enums.Health, as: Health

  defevent superseded_by: Trento.SapSystems.Events.ApplicationInstanceStatusChanged do
    field :sap_system_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :instance_number, :string
    field :health, Ecto.Enum, values: Health.values()
  end
end
