# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.SapSystems.Projections.SapSystemHealthDetails do
  @moduledoc """
  Health details for SAP Systems in read model format.
  """
  @required_fields []

  use Trento.Support.Type

  alias Trento.Support.HealthValueDetails

  deftype do
    embeds_one :instances_health, HealthValueDetails,
      on_replace: :update,
      defaults_to_struct: true

    embeds_one :database_health, HealthValueDetails, on_replace: :update, defaults_to_struct: true
  end
end
