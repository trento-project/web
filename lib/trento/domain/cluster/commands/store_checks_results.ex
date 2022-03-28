defmodule Trento.Domain.Commands.StoreChecksResults do
  @moduledoc """
  Store the checks results coming from an execution on a specific host.
  """

  @required_fields :all

  use Trento.Command

  alias Trento.Domain.CheckResult

  defcommand do
    field :cluster_id, :string
    field :host_id, :string
    embeds_many :checks_results, CheckResult
  end
end
