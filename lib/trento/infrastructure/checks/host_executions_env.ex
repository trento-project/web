defmodule Trento.Infrastructure.Checks.HostExecutionEnv do
  @moduledoc """
  Host checks execution env map
  """

  @required_fields :all
  use Trento.Type

  require Trento.Domain.Enums.Provider, as: Provider

  deftype do
    field :provider, Ecto.Enum, values: Provider.values()
  end
end
