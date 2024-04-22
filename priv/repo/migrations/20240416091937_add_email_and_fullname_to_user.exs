defmodule Trento.Repo.Migrations.AddEmailAndFullnameToUser do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :email, :string
      add :fullname, :string
    end
  end
end
