defmodule Trento.Repo.Migrations.AddTagsAbilities do
  use Ecto.Migration

  def up do
    for tag_resource <- [:host, :cluster, :database, :sap_system] do
      execute "INSERT INTO abilities(name, resource, label, inserted_at, updated_at) VALUES ('all', '#{tag_resource}_tags', 'Permits all operation on #{tag_resource} tags', NOW(), NOW())"
    end
  end

  def down do
    for tag_resource <- [:host, :cluster, :database, :sap_system] do
      execute "DELETE FROM abilities WHERE name = 'all' AND resource = '#{tag_resource}_tags'"
    end
  end
end
