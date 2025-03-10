defmodule Trento.Settings.AlertingSettings do
  @moduledoc """
  Schema and functions related to alerting settings.
  """

  use Ecto.Schema
  use Trento.Support.Ecto.STI, sti_identifier: :alerting_settings

  import Ecto.Changeset

  alias Trento.Repo

  @type t :: %__MODULE__{}
  @type alerting_setting_submission :: %{
          enabled: boolean,
          sender_email: String.t(),
          recipient_email: String.t(),
          smtp_server: String.t(),
          smtp_port: String.t() | integer,
          smtp_username: String.t(),
          smtp_password: String.t()
        }

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "settings" do
    field :enabled, :boolean, source: :alerting_enabled
    field :sender_email, :string, source: :alerting_sender_email
    field :recipient_email, :string, source: :alerting_recipient_email
    field :smtp_server, :string, source: :alerting_smtp_server
    field :smtp_port, :integer, source: :alerting_smtp_port
    field :smtp_username, :string, source: :alerting_smtp_username
    field :smtp_password, Trento.Support.Ecto.EncryptedBinary, source: :alerting_smtp_password

    timestamps(type: :utc_datetime_usec)
    sti_fields()
  end

  defp changeset(alerting_settings, changes) do
    alerting_settings
    |> cast(changes, [
      :enabled,
      :sender_email,
      :recipient_email,
      :smtp_server,
      :smtp_port,
      :smtp_username,
      :smtp_password
    ])
    |> sti_changes()
    |> validate_required([
      :type,
      :enabled,
      :sender_email,
      :recipient_email,
      :smtp_server,
      :smtp_port,
      :smtp_username,
      :smtp_password
    ])
    |> validate_format(:sender_email, ~r/@/, message: "Invalid e-mail address.")
    |> validate_format(:recipient_email, ~r/@/, message: "Invalid e-mail address.")
    |> validate_number(:smtp_port,
      greater_than: 0,
      less_than_or_equal_to: 65535,
      message: "Invalid port number."
    )
    |> unique_constraint(:type)
  end

  @spec get_alerting_settings :: {:ok, t()} | {:error, :alerting_settings_not_configured}
  def get_alerting_settings do
    settings = Repo.one(base_query())

    if settings do
      {:ok, settings}
    else
      {:error, :alerting_settings_not_configured}
    end
  end

  @spec set_alerting_settings(alerting_setting_submission) :: {:ok, t()} | {:error, any}
  def set_alerting_settings(alerting_settings) do
    %__MODULE__{}
    |> changeset(alerting_settings)
    # We're using Upsert
    |> Repo.insert(
      on_conflict: {:replace_all_except, [:id, :inserted_at]},
      conflict_target: :type,
      returning: true
    )
  end
end
