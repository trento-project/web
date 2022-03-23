defmodule Trento.Integration.Checks.Gen do
  @moduledoc """
  Behaviour of a telemetry adapter.
  """

  @callback request_execution(
              execution_id :: String.t(),
              cluster_id :: [String.t()],
              hosts :: String.t(),
              selected_checks :: [String.t()]
            ) ::
              :ok | {:error, any}
end
