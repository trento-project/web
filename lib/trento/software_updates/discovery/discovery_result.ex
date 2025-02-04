defmodule Trento.SoftwareUpdates.Discovery.DiscoveryResult do
  @moduledoc """
  This is the schema used to store the results of the software updates discovery process.
  """

  use Ecto.Schema
  import Ecto.Changeset

  require Trento.SoftwareUpdates.Enums.AdvisoryType, as: AdvisoryType

  @type t :: %__MODULE__{}

  @fields ~w(host_id system_id failure_reason)a
  @relevant_patches_fields ~w(id advisory_name advisory_status advisory_synopsis advisory_type date update_date)a
  @upgradable_packages_fields ~w(arch from_epoch from_release from_version name to_epoch to_package_id to_release to_version)a

  @primary_key {:host_id, :binary_id, autogenerate: false}
  schema "software_updates_discovery_result" do
    field :system_id, :string
    field :failure_reason, :string

    embeds_many :relevant_patches, RelevantPatches, primary_key: false do
      field :id, :integer, primary_key: true
      field :advisory_name, :string
      field :advisory_status, :string
      field :advisory_synopsis, :string
      field :advisory_type, Ecto.Enum, values: AdvisoryType.values()
      field :date, :date
      field :update_date, :date
    end

    embeds_many :upgradable_packages, UpgradablePackage, primary_key: false do
      field :arch, :string
      field :from_epoch, :string
      field :from_release, :string
      field :from_version, :string
      field :name, :string
      field :to_epoch, :string
      field :to_package_id, :string
      field :to_release, :string
      field :to_version, :string
    end

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(discovery_result, attrs) do
    discovery_result
    |> cast(attrs, @fields)
    |> cast_embed(:relevant_patches, with: &relevant_patch_changeset/2)
    |> cast_embed(:upgradable_packages, with: &upgradable_package_changeset/2)
  end

  defp relevant_patch_changeset(relevant_patch, params) do
    cast(relevant_patch, params, @relevant_patches_fields)
  end

  defp upgradable_package_changeset(upgradable_package, params) do
    cast(upgradable_package, params, @upgradable_packages_fields)
  end
end
