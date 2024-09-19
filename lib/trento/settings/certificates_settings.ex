defmodule Trento.Settings.CertificatesSettings do
  @moduledoc """
  CertificatesSettings is the STI projection containing SSL certificates
  """

  use Ecto.Schema
  use Trento.Support.Ecto.STI, sti_identifier: :certificates_settings

  import Ecto.Changeset

  alias Trento.Support.Ecto.EncryptedBinary

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: true}
  schema "settings" do
    field :name, :string, source: :certificates_settings_name
    field :key_file, EncryptedBinary, source: :certificates_settings_key_file
    field :certificate_file, EncryptedBinary, source: :certificates_settings_certificate_file

    timestamps(type: :utc_datetime_usec)
    sti_fields()
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(certificates_settings, attrs) do
    certificates_settings
    |> cast(attrs, __MODULE__.__schema__(:fields))
    |> validate_required([:name, :key_file, :certificate_file])
    # TODO: move suse_manager_settings.ex certificates function to some support module
    # |> validate_cert_and_key
    |> sti_changes()
    |> unique_constraint(:name)
    |> unique_constraint(:type)
  end
end
