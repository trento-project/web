defmodule Trento.Clusters.Gen do
  @moduledoc """
  Request checks execution adapter
  """

  @callback request_checks_execution(cluster_id :: String.t()) :: :ok | {:error, any}
end
