# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.ValueObjects.HanaClusterHealthDetails do
  @moduledoc """
  Hana cluster health details.

  Additional information about the fields available in the cluster
  aggregate docstring.
  """

  @required_fields [:sbd_health, :replication_health]

  use Trento.Support.Type

  require Trento.Enums.Health, as: Health

  deftype do
    field :checks_health, Ecto.Enum, values: Health.values(), default: Health.unknown()
    field :sbd_health, Ecto.Enum, values: Health.values()
    field :replication_health, Ecto.Enum, values: Health.values()
  end
end
