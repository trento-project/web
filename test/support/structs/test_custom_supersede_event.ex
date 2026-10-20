# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TestCustomSupersedeEvent do
  @moduledoc false

  def supersede(%{"data" => "new"}), do: TestEvent

  use Trento.Support.Event

  defevent do
    field :data, :string
  end
end
