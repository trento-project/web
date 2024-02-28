defmodule Trento.Trento.Hosts.Projections.SoftwareUpdatesReadModel do
  @moduledoc """
  A Host's software updates read model
  """
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:host_id, :binary_id, autogenerate: false}
  schema "software_updates" do
    field :system_id, :string
    field :fully_qualified_domain_name, :string
    field :relevant_patches, :integer, default: 0
    field :upgradable_packages, :integer, default: 0
    field :security_advisories, :integer, default: 0
    field :bug_fixes, :integer, default: 0
    field :software_enhancements, :integer, default: 0
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(software_updates_read_model, attrs) do
    cast(software_updates_read_model, attrs, __MODULE__.__schema__(:fields))
  end
end
