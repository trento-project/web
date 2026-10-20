# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TestRollUpEvent do
  @moduledoc false

  use Trento.Support.Event

  defevent do
    field :snapshot, :map
  end
end
