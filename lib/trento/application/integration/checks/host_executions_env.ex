defmodule Trento.Integration.Checks.HostExecutionEnv do
  @moduledoc """
  Cluster checks execution env map
  """

  @required_fields :all
  use Trento.Type

  require Trento.Domain.Enums.Provider, as: Provider

  deftype do
    field :provider, Ecto.Enum, values: Provider.values()
  end
end
