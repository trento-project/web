defmodule Trento.Infrastructure.Checks.HostExecutionEnv do
  @moduledoc """
  Host checks execution env map
  """

  @required_fields :all
  use Trento.Support.Type

  require Trento.Enums.Provider, as: Provider
  require Trento.Hosts.Enums.Architecture, as: Architecture

  deftype do
    field :provider, Ecto.Enum, values: Provider.values()
    field :arch, Ecto.Enum, values: Architecture.values()
  end
end
