# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Operations.AMQP.Publisher do
  @moduledoc """
  AMQP operations publisher
  """

  use Trento.Infrastructure.Messaging.Adapter.AMQP.Publisher, id: __MODULE__, name: :operations
end
