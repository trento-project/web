defmodule Trento.Infrastructure.ComponentVersions.Gen do
  @moduledoc """
  Behaviour for fetching component versions.
  """

  @callback get_versions() :: %{
              wanda_version: String.t() | nil,
              checks_version: String.t() | nil,
              postgres_version: String.t() | nil,
              rabbitmq_version: String.t() | nil,
              prometheus_version: String.t() | nil
            }
end
