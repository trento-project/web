# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Discovery.AMQP.Publisher do
  @moduledoc """
  AMQP discovery publisher
  """

  use Trento.Infrastructure.Messaging.Adapter.AMQP.Publisher, id: __MODULE__, name: :discoveries
end
