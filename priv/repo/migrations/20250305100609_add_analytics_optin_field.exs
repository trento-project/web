defmodule Trento.Repo.Migrations.AddAnalyticsOptinField do
  use Ecto.Migration

  def change do
    alter table(:settings) do
      add :analytics_settings_opt_in, :boolean
    end
  end
end
