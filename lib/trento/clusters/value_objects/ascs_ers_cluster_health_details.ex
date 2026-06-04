# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.ValueObjects.AscsErsClusterHealthDetails do
  @moduledoc """
  ASCS/ERS cluster health details.

  Additional information about the fields available in the cluster
  aggregate docstring.
  """

  @required_fields []

  use Trento.Support.Type

  require Trento.Enums.Health, as: Health

  deftype do
    field :checks_health, Ecto.Enum, values: Health.values(), default: Health.unknown()
    field :distributed_health, Ecto.Enum, values: Health.values(), default: Health.unknown()
  end
end
