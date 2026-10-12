# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.MonitoringChannel do
  @moduledoc """
  Monitoring CHannel
  """

  use TrentoWeb, :channel

  @impl true
  def join("monitoring:" <> _resource_name, _payload, socket), do: {:ok, socket}
end
