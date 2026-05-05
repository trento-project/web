# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Databases.ValueObjects.Tenant do
  @moduledoc """
  Database tenant information
  """
  @required_fields :all

  use Trento.Support.Type

  deftype do
    field :name, :string
  end
end
