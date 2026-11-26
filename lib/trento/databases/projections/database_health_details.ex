# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Databases.Projections.DatabaseHealthDetails do
  @moduledoc """
  Health details for Databases in read model format.
  """
  @required_fields []

  use Trento.Support.Type

  alias Trento.Support.HealthValueDetails

  deftype do
    embeds_one :instances_health, HealthValueDetails,
      on_replace: :update,
      defaults_to_struct: true
  end
end
