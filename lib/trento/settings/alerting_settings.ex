defmodule Trento.Settings.AlertingSettings do
  @moduledoc """
  Schema and functions related to alerting settings.
  """

  use Ecto.Schema
  use Trento.Support.Ecto.STI, sti_identifier: :alerting_settings

  import Ecto.Changeset
  import Ecto.Query, only: [from: 2]

  alias Trento.Repo

  @default_env_settings %{
    enabled: false,
    sender: "alerts@trento-project.io",
    recipient: "admin@trento-project.io",
    relay: "",
    port: 587,
    username: "",
    password: ""
  }

  @type t :: %__MODULE__{}
  @type alerting_setting_set_t :: %{
          enabled: boolean,
          sender_email: String.t(),
          recipient_email: String.t(),
          smtp_server: String.t(),
          smtp_port: String.t() | integer,
          smtp_username: String.t(),
          smtp_password: String.t()
        }
  @type alerting_setting_update_t :: %{
          enabled: boolean | nil,
          sender_email: String.t() | nil,
          recipient_email: String.t() | nil,
          smtp_server: String.t() | nil,
          smtp_port: String.t() | integer | nil,
          smtp_username: String.t() | nil,
          smtp_password: String.t() | nil
        }

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "settings" do
    field :enabled, :boolean, source: :alerting_enabled
    field :sender_email, :string, source: :alerting_sender_email
    field :recipient_email, :string, source: :alerting_recipient_email
    field :smtp_server, :string, source: :alerting_smtp_server
    field :smtp_port, :integer, source: :alerting_smtp_port
    field :smtp_username, :string, source: :alerting_smtp_username

    field :smtp_password, Trento.Support.Ecto.EncryptedBinary,
      source: :alerting_smtp_password,
      redact: true

    field :enforced_from_env, :boolean, virtual: true, default: false
    timestamps(type: :utc_datetime_usec)
    sti_fields()
  end

  @spec enforced_from_env? :: boolean()
  def enforced_from_env? do
    raw_alerting_app_env()
    |> Enum.map(fn {_key, val} -> val != nil end)
    |> Enum.any?()
  end

  @spec get_alerting_settings :: {:ok, t()} | {:error, :alerting_settings_not_configured}
  def get_alerting_settings do
    if enforced_from_env?() do
      get_from_app_env()
    else
      get_from_db()
    end
  end

  @spec set_alerting_settings(alerting_setting_set_t()) ::
          {:ok, t()} | {:error, :alerting_settings_enforced} | {:error, Changeset.t()}
  def set_alerting_settings(alerting_settings) do
    if enforced_from_env?() do
      {:error, :alerting_settings_enforced}
    else
      chset = save_changeset(%__MODULE__{}, alerting_settings)

      Repo.insert(
        chset,
        on_conflict: {:replace_all_except, [:id, :inserted_at]},
        conflict_target: :type,
        returning: true
      )
    end
  end

  @spec update_alerting_settings(alerting_setting_update_t()) ::
          {:ok, t()}
          | {:error, :alerting_settings_enforced}
          | {:error, :alerting_settings_not_configured}
          | {:error, Changeset.t()}
  def update_alerting_settings(alerting_settings) do
    if enforced_from_env?() do
      {:error, :alerting_settings_enforced}
    else
      changes =
        update_changeset(%__MODULE__{}, alerting_settings)
        |> Map.fetch!(:changes)
        |> Map.put(:updated_at, DateTime.utc_now())
        |> Map.to_list()

      query =
        from s in __MODULE__,
          where: [type: :alerting_settings],
          update: [set: ^changes],
          select: s

      try do
        {_count, [settings]} = Repo.update_all(query, [])
        {:ok, settings}
      rescue
        _exc ->
          {:error, :alerting_settings_not_configured}
      end
    end
  end

  # Private functions

  @spec common_validations(Changeset.t()) :: Changeset.t()
  defp common_validations(changeset) do
    changeset
    |> validate_format(:sender_email, ~r/@/, message: "Invalid e-mail address.")
    |> validate_format(:recipient_email, ~r/@/, message: "Invalid e-mail address.")
    |> validate_number(:smtp_port,
      greater_than: 0,
      less_than_or_equal_to: 65_535,
      message: "Invalid port number."
    )
  end

  @spec save_changeset(t(), map()) :: Changeset.t()
  defp save_changeset(alerting_settings, changes) do
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
    |> common_validations()
    |> unique_constraint(:type)
  end

  @spec update_changeset(t(), map()) :: Changeset.t()
  defp update_changeset(alerting_settings, changes) do
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
    |> common_validations()
  end

  @spec raw_alerting_app_env :: Keyword.t()
  defp raw_alerting_app_env do
    Application.get_env(:trento, Trento.Mailer)
    |> Keyword.take([:relay, :port, :username, :password])
    |> Enum.concat(Application.get_env(:trento, :alerting))
  end

  @spec get_from_app_env :: {:ok, t()}
  defp get_from_app_env do
    explicitly_set =
      raw_alerting_app_env()
      |> Enum.filter(fn {_key, value} -> value != nil end)
      |> Map.new()

    %{
      enabled: enabled,
      sender: sender,
      recipient: recipient,
      relay: relay,
      port: port,
      username: username,
      password: password
    } = Map.merge(@default_env_settings, explicitly_set)

    settings = %Trento.Settings.AlertingSettings{
      enabled: enabled,
      sender_email: sender,
      recipient_email: recipient,
      smtp_server: relay,
      smtp_port: port,
      smtp_username: username,
      smtp_password: password
    }

    {:ok, settings}
  end

  @spec get_from_db :: {:ok, t()} | {:error, :alerting_settings_not_configured}
  defp get_from_db do
    settings = Repo.one(base_query())

    if settings do
      settings = %Trento.Settings.AlertingSettings{settings | enforced_from_env: false}
      {:ok, settings}
    else
      {:error, :alerting_settings_not_configured}
    end
  end
end
