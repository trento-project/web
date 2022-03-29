defmodule Trento.Integration.Checks.ExecutionCompletedEvent do
  @moduledoc """
  Schema of the checks execution completed integration event emitted by the runner.
  """

  @required_fields :all

  use Trento.Type

  deftype do
    field :cluster_id, Ecto.UUID

    embeds_many :hosts, Host do
      field :host_id, Ecto.UUID

      embeds_many :results, Result do
        field :check_id, :string
        field :result, Ecto.Enum, values: [:passing, :warning, :critical]
      end
    end
  end

  def changeset(event, attrs) do
    event
    |> cast(attrs, [:cluster_id])
    |> cast_embed(:hosts, with: &host_changeset/2)
    |> validate_required_fields(@required_fields)
  end

  defp host_changeset(host, attrs) do
    host
    |> cast(attrs, [:host_id])
    |> cast_embed(:results, with: &result_changeset/2)
    |> validate_required([:host_id])
  end

  defp result_changeset(result, attrs) do
    result
    |> cast(attrs, [:check_id, :result])
    |> validate_required([:check_id, :result])
  end
end
