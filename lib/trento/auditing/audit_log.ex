defmodule Trento.Auditing.AuditLog do
  use Ecto.Schema
  import Ecto.Changeset

  schema "audit_logs" do
    field :type, :string
    field :actor, :string
    field :outcome, :string
    field :metadata, :map

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(audit_log, attrs) do
    audit_log
    |> cast(attrs, __MODULE__.__schema__(:fields))
    |> validate_required([:type, :actor, :outcome, :metadata])
  end
end
