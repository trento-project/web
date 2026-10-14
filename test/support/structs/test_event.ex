# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TestEvent do
  @moduledoc false

  use Trento.Support.Event

  defevent do
    field :data, :string
  end
end
