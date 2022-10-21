defmodule Trento.Integration.Checks.Wanda.Behaviour do
  @moduledoc """
  Wanda event policy behaviour
  """

  alias Trento.Checks.V1.ExecutionCompleted

  @callback handle(event :: ExecutionCompleted.t()) ::
              {:ok, command :: any, opts :: Keyword.t()} | {:error, any}
end
