defmodule Trento.Repo.Migrations.AddAnalyticsOptInToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :analytics_opt_in, :boolean, default: false
    end
  end
end
