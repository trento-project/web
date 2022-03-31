defmodule Trento.Integration.Checks.Gen do
  @moduledoc """
  Behaviour of a runner adapter.
  """

  alias Trento.Integration.Checks.FlatCatalogDto

  @callback request_execution(
              execution_id :: String.t(),
              cluster_id :: [String.t()],
              hosts :: String.t(),
              checks :: [String.t()]
            ) ::
              :ok | {:error, any}

  @callback get_catalog() ::
              {:ok, FlatCatalogDto.t()} | {:error, any}
end
