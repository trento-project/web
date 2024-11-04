defmodule Trento.Repo.Migrations.AddHanaScenario do
  use Ecto.Migration

  def change do
    alter table(:clusters) do
      add :hana_scenario, :string
    end
  end
end
