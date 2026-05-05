# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.Checks.AMQP.Consumer do
  @moduledoc """
  AMQP checks consumer.
  """

  use Trento.Infrastructure.Messaging.Adapter.AMQP.Consumer, id: __MODULE__, name: :checks
end
