defmodule Tronto.Monitoring.Domain.Commands.RegisterApplicationInstance do
  @moduledoc """
  Register an application instance to the monitoring system.
  """

  use TypedStruct
  use Domo

  alias Tronto.Monitoring.Domain.Health

  typedstruct do
    @typedoc "RegisterApplicationInstance command"

    field :sap_system_id, String.t() | nil
    field :sid, String.t(), enforce: true
    field :db_host, String.t(), enforce: true
    field :tenant, String.t(), enforce: true
    field :host_id, String.t(), enforce: true
    field :instance_number, String.t(), enforce: true
    field :features, String.t(), enforce: true
    field :health, Health.t(), enforce: true
  end

  use Vex.Struct

  validates :sap_system_id, uuid: true
  validates :host_id, uuid: true
end
