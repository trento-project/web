# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TestLegacyEventV2 do
  @moduledoc false

  use Trento.Support.Event

  defevent superseded_by: TestEvent do
    field :data, :string
  end
end
