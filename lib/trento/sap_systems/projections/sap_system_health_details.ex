# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.SapSystems.Projections.SapSystemHealthDetails do
  @moduledoc """
  Health details for SAP Systems in read model format.
  """
  @required_fields [:instances_health, :database_health]

  use Trento.Support.Type

  alias Trento.Support.HealthValueDetails

  deftype do
    embeds_one :instances_health, HealthValueDetails, on_replace: :update
    embeds_one :database_health, HealthValueDetails, on_replace: :update
  end
end
