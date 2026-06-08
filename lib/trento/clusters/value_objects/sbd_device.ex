# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.ValueObjects.SbdDevice do
  @moduledoc """
  Represents the SBDDevice of a HANA cluster.
  """

  @required_fields :all
  @allowed_statuses ["healthy", "unhealthy"]

  use Trento.Support.Type

  deftype do
    field :device, :string
    field :status, :string
  end

  def changeset(%__MODULE__{} = struct, params) do
    super(struct, params)
    |> validate_inclusion(:status, @allowed_statuses)
  end
end
