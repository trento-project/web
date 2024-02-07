defmodule Trento.SoftwareUpdates.Settings do
  @moduledoc """
  Schema for software updates settings.
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Trento.Support.DateService

  @type t :: %__MODULE__{}

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "software_update_settings" do
    field :url, :string
    field :username, :string
    field :password, Trento.Support.Ecto.EncryptedBinary
    field :ca_cert, Trento.Support.Ecto.EncryptedBinary
    field :ca_uploaded_at, :utc_datetime_usec

    timestamps(type: :utc_datetime_usec)
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(software_updates_settings, attrs, date_service \\ DateService) do
    software_updates_settings
    |> cast(attrs, __MODULE__.__schema__(:fields))
    |> validate_required([:url, :username, :password])
    |> validate_change(:url, &validate_url/2)
    |> maybe_add_cert_upload_date(date_service)
  end

  defp validate_url(_url_atom, url) do
    case URI.parse(url) do
      %URI{scheme: "https"} ->
        []

      _ ->
        [url: {"can only be an https url", validation: :https_url_only}]
    end
  end

  defp maybe_add_cert_upload_date(changeset, date_service) do
    if get_change(changeset, :ca_cert) do
      put_change(changeset, :ca_uploaded_at, date_service.utc_now())
    else
      changeset
    end
  end
end
