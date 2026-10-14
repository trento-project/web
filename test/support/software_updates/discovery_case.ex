# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.SoftwareUpdates.DiscoveryCase do
  @moduledoc false

  use ExUnit.CaseTemplate

  setup _ do
    Mox.stub_with(
      Trento.SoftwareUpdates.Discovery.Mock,
      Trento.Infrastructure.SoftwareUpdates.MockSmlm
    )

    :ok
  end
end
