defmodule Trento.Repo.Migrations.AddAnalyticsEulaAcceptedAtToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :analytics_eula_accepted_at, :utc_datetime_usec
    end
  end
end
