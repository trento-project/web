defmodule Trento.Repo.Migrations.AddChecksExecutionSettings do
  use Ecto.Migration

  def up do
    alter table(:settings) do
      add :checks_execution_interval, :string
    end

    execute """
    INSERT INTO abilities(name, resource, label, inserted_at, updated_at)
    VALUES ('all', 'checks_execution_settings', 'Permits changing the checks execution interval', NOW(), NOW())
    """
  end

  def down do
    execute "DELETE FROM abilities WHERE name = 'all' AND resource = 'checks_execution_settings'"

    alter table(:settings) do
      remove :checks_execution_interval
    end
  end
end
