# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TestEvent do
  @moduledoc false

  use Trento.Support.Event

  defevent do
    field :data, :string
  end
end
