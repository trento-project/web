defmodule Trento.Repo.Migrations.AddActivityLogMetadataIndex do
  use Ecto.Migration

  def change do
    create index("activity_logs", ["metadata jsonb_path_ops"],
             name: "activity_logs_metadata_containment_idx",
             using: "GIN"
           )
  end
end
