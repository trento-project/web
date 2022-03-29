defmodule Trento.Integration.Checks.Gen do
  @moduledoc """
  Behaviour of a runner adapter.
  """

  @callback request_execution(
              execution_id :: String.t(),
              cluster_id :: [String.t()],
              hosts :: String.t(),
              selected_checks :: [String.t()]
            ) ::
              :ok | {:error, any}

  @callback get_runner_ready_content(runner_url :: String.t()) ::
              {:ok, term} | {:error, any}

  @callback get_catalog_content(runner_url :: String.t()) ::
              {:ok, term} | {:error, any}
end
