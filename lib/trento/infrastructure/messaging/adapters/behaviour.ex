defmodule Trento.Messaging.Adapters.Behaviour do
  @moduledoc false

  @callback publish(topic :: String.t(), message :: any) :: :ok | {:error, any()}
end
