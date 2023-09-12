defmodule Trento.Integration.Discovery.SaptuneDiscoveryPayload do
  @required_fields nil

  use Trento.Type

  deftype do
    field :package_version, :string
    field :configured_version, :string
    field :tuning_state, :string
    field :services, :map
    field :notes_enabled_by_solution, {:array, :map}
    field :notes_applied_by_solution, {:array, :map}
    field :notes_enabled_additionally, {:array, :string}
    field :solution_enabled, {:array, :map}
    field :solution_applied, {:array, :map}
    field :notes_enabled, {:array, :string}
    field :notes_applied, {:array, :string}
    field :staging, :map
  end
end
