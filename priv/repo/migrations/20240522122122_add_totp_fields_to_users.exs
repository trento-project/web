defmodule Trento.Repo.Migrations.AddTotpFieldsToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :totp_enabled_at, :utc_datetime_usec
      add :totp_last_used_at, :utc_datetime_usec
      add :totp_secret, :binary
    end
  end
end
