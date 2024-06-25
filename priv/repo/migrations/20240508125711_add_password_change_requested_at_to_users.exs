defmodule Trento.Repo.Migrations.AddPasswordChangeRequestedAtToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :password_change_requested_at, :utc_datetime_usec
    end
  end
end
