defmodule Trento.Integration.Discovery.SaptuneDiscoveryPayload do
  @required_fields :all

  use Trento.Type

  deftype do
    field :package_version, :string
    field :configured_version, :string
    field :tuning_state, :string
    field :services, :integer
    field :enabled_solution, :integer
    field :applied_solution, :integer
    field :staging, :string
  end
end
