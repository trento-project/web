# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.ValueObjects.AscsErsClusterHealthDetails do
  @moduledoc """
  ASCS/ERS cluster health details.

  Additional information about the fields available in the cluster
  aggregate docstring.
  """

  @required_fields [:distributed_health]

  use Trento.Support.Type

  require Trento.Enums.Health, as: Health

  deftype do
    field :checks_health, Ecto.Enum, values: Health.values(), default: Health.unknown()
    field :sbd_health, Ecto.Enum, values: Health.values(), default: Health.unknown()
    field :distributed_health, Ecto.Enum, values: Health.values()
  end
end

defmodule Trento.Clusters.ValueObjects.AscsErsClusterHealthDetailsRead do
  use Ecto.Schema

  import Ecto.Changeset

  alias Trento.Support.HealthValueDetails

  @derive {Jason.Encoder, except: [:__struct__]}
  @primary_key false
  embedded_schema do
    embeds_one :checks_health, HealthValueDetails
    embeds_one :sbd_health, HealthValueDetails
    embeds_one :distributed_health, HealthValueDetails
  end

  def changeset(%__MODULE__{} = struct, attrs) do
    struct
    |> cast(attrs, [])
    |> cast_embed(:checks_health, required: true)
    |> cast_embed(:sbd_health, required: true)
    |> cast_embed(:distributed_health, required: true)
  end
end
