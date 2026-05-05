# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.Messaging.Adapter.Gen do
  @moduledoc false

  @callback publish(publisher :: module(), topic :: String.t(), message :: any) ::
              :ok | {:error, any()}
end
