defmodule Trento.Integration.Checks.Gen do
  @moduledoc """
  Behaviour of a runner adapter.
  """

  alias Trento.Domain.Catalog

  @callback request_execution(
              execution_id :: String.t(),
              cluster_id :: [String.t()],
              hosts :: String.t(),
              selected_checks :: [String.t()]
            ) ::
              :ok | {:error, any}

  @callback get_catalog() ::
              {:ok, [Catalog.t()]} | {:error, any}
end
