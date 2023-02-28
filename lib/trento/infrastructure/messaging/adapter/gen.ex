defmodule Trento.Infrastructure.Messaging.Adapter.Gen do
  @moduledoc false

  @callback publish(topic :: String.t(), message :: any) :: :ok | {:error, any()}
end
