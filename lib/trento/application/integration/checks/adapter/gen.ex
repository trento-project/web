defmodule Trento.Integration.Checks.Gen do
  @moduledoc """
  Behaviour of a check adapter.
  """

  @callback request_execution(
              execution_id :: String.t(),
              cluster_id :: String.t(),
              provider :: atom,
              hosts_settings :: [map],
              checks :: [String.t()]
            ) ::
              :ok | {:error, any}
end
