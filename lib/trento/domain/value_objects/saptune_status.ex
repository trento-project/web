defmodule Trento.Domain.SaptuneStatus do
  alias Trento.Domain.{
    SaptuneNote,
    SaptuneSolution,
    SaptuneStaging,
    SaptuneServiceStatus
  }

  @required_fields nil

  use Trento.Type

  deftype do
    field :package_version, :string
    field :configured_version, :string
    field :tuning_state, :string

    embeds_many :services, SaptuneServiceStatus
    embeds_many :enabled_notes, SaptuneNote
    embeds_many :applied_notes, SaptuneNote
    embeds_one :enabled_solution, SaptuneSolution
    embeds_one :applied_solution, SaptuneSolution
    embeds_one :staging, SaptuneStaging
  end
end
