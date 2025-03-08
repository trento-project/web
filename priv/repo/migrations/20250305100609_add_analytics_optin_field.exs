defmodule Trento.Repo.Migrations.AddAnalyticsOptinField do
  use Ecto.Migration

  def change do
    alter(table(:settings)) do
      add :analytics_optin, :boolean, default: false
    end
  end
end
