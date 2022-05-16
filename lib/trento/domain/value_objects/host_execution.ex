defmodule Trento.Domain.HostExecution do
  @moduledoc """
  Host checks results value object
  """

  @required_fields [:host_id, :reachable]

  use Trento.Type
  alias Trento.Domain.CheckResult

  deftype do
    field :host_id, Ecto.UUID
    field :reachable, :boolean
    field :msg, :string, default: ""

    embeds_many :checks_results, CheckResult
  end
end
