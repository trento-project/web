defmodule Trento.Settings.SuseManagerSettings do
  @moduledoc """
  Schema for software updates settings.
  """

  use Ecto.Schema
  use Trento.Support.Ecto.STI, sti_identifier: :suse_manager_settings

  import Ecto.Changeset

  alias Trento.Support.DateService

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: true}
  schema "settings" do
    field :url, :string, source: :suse_manager_settings_url
    field :username, :string, source: :suse_manager_settings_username
    field :password, Trento.Support.Ecto.EncryptedBinary, source: :suse_manager_settings_password
    field :ca_cert, Trento.Support.Ecto.EncryptedBinary, source: :suse_manager_settings_ca_cert
    field :ca_uploaded_at, :utc_datetime_usec, source: :suse_manager_settings_ca_uploaded_at

    timestamps(type: :utc_datetime_usec)
    sti_fields()
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(software_updates_settings, attrs, date_service \\ DateService) do
    software_updates_settings
    |> cast(attrs, __MODULE__.__schema__(:fields))
    |> validate_required([:url, :username, :password])
    |> validate_change(:url, &validate_url/2)
    |> maybe_validate_ca_cert(attrs)
    |> maybe_change_cert_upload_date(attrs, date_service)
    |> sti_changes()
    |> unique_constraint(:type)
  end

  defp validate_url(_url_atom, url) do
    case URI.parse(url) do
      %URI{scheme: "https"} ->
        []

      _ ->
        [url: {"can only be an https url", validation: :https_url_only}]
    end
  end

  defp maybe_validate_ca_cert(changeset, %{ca_cert: nil}), do: changeset

  defp maybe_validate_ca_cert(changeset, %{ca_cert: _ca_cert}) do
    changeset
    |> validate_required(:ca_cert)
    |> validate_change(:ca_cert, &validate_ca_cert/2)
  end

  defp maybe_validate_ca_cert(changeset, _), do: changeset

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
  rescue
    _ ->
      # We discovered that an exception is thrown when attempting to parse invalid strings
      # wrapped in valid headers like "foobar"
      # https://github.com/trento-project/web/pull/2581#pullrequestreview-2040240059
      {:error, [ca_cert: {"unable to parse X.509 certificate", validation: :ca_cert_parsing}]}
  end

  defp ca_cert_valid?(certificate) do
    now = DateTime.utc_now()
    {:Validity, never_before, never_after} = X509.Certificate.validity(certificate)

    if never_before |> X509.DateTime.to_datetime() |> DateTime.before?(now) and
         never_after |> X509.DateTime.to_datetime() |> DateTime.after?(now) do
      :ok
    else
      {:error, [ca_cert: {"the X.509 certificate is not valid", validation: :ca_cert_validity}]}
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
