# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Hosts.Events.SlesSubscriptionsUpdated do
  @moduledoc """
  Subscriptions updated event
  """

  alias Trento.Hosts.ValueObjects.SlesSubscription

  use Trento.Support.Event

  defevent do
    field :host_id, Ecto.UUID
    embeds_many :subscriptions, SlesSubscription
  end
end
