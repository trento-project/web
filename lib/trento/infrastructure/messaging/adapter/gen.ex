# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Messaging.Adapter.Gen do
  @moduledoc false

  @callback publish(publisher :: module(), topic :: String.t(), message :: any) ::
              :ok | {:error, any()}
end
