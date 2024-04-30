defmodule Trento.SoftwareUpdates.Settings do
  @moduledoc """
  Schema for software updates settings.
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Trento.Support.DateService

  @type t :: %__MODULE__{}

  @primary_key {:id, :binary_id, autogenerate: false}
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
    |> maybe_validate_ca_cert(attrs)
    |> maybe_change_cert_upload_date(attrs, date_service)
    |> unique_constraint(:id, name: :software_update_settings_pkey)
  end

  defp validate_url(_url_atom, url) do
    case URI.parse(url) do
      %URI{scheme: "https"} ->
        []

      _ ->
        [url: {"can only be an https url", validation: :https_url_only}]
    end
  end

  defp validate_ca_cert(_ca_cert_atom, ca_cert) do
    with {:ok, certificate} <- parse_ca_cert(ca_cert),
         :ok <- ca_cert_valid?(certificate) do
      []
    else
      {:error, errors} -> errors
    end
  end

  defp parse_ca_cert(ca_cert) do
    case X509.Certificate.from_pem(ca_cert) do
      {:ok, _} = result ->
        result

      _ ->
        {:error, [ca_cert: {"unable to parse X.509 certificate", validation: :ca_cert_parsing}]}
    end
  end

  defp ca_cert_valid?(certificate) do
    now = DateTime.utc_now()
    {:Validity, never_before, never_after} = X509.Certificate.validity(certificate)

    if never_before |> X509.DateTime.to_datetime() |> DateTime.compare(now) == :lt and
         never_after |> X509.DateTime.to_datetime() |> DateTime.compare(now) == :gt do
      :ok
    else
      {:error, [ca_cert: {"the X.509 certificate is not valid", validation: :ca_cert_validity}]}
    end
  end

  defp maybe_validate_ca_cert(changeset, settings_submission) do
    if nil != Map.get(settings_submission, :ca_cert) do
      changeset
      |> validate_required(:ca_cert)
      |> validate_change(:ca_cert, &validate_ca_cert/2)
    else
      changeset
    end
  end

  defp maybe_change_cert_upload_date(changeset, settings_submission, date_service) do
    changeset
    |> maybe_add_cert_upload_date(date_service)
    |> maybe_remove_cert_upload_date(settings_submission)
  end

  defp maybe_add_cert_upload_date(changeset, date_service) do
    if get_change(changeset, :ca_cert) do
      put_change(changeset, :ca_uploaded_at, date_service.utc_now())
    else
      changeset
    end
  end

  defp maybe_remove_cert_upload_date(changeset, settings_submission) do
    with true <- Map.has_key?(settings_submission, :ca_cert),
         true <- changed?(changeset, :ca_cert),
         nil <- get_change(changeset, :ca_cert) do
      put_change(changeset, :ca_uploaded_at, nil)
    else
      _ ->
        changeset
    end
  end
end
