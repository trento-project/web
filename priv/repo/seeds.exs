# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Trento.Repo.insert!(%Trento.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

%{id: admin_user_id} =
  %Trento.Users.User{}
  |> Trento.Users.User.changeset(%{
    username: "admin",
    password: "adminpassword",
    confirm_password: "adminpassword",
    fullname: "Trento Admin",
    email: "admin@trento.suse.com",
    enabled: true
  })
  |> Trento.Repo.insert!(
    on_conflict: [set: [password_hash: Argon2.hash_pwd_salt("adminpassword")]],
    conflict_target: :username
  )

# Attach all:all ability
%Trento.Abilities.UsersAbilities{}
|> Trento.Abilities.UsersAbilities.changeset(%{user_id: admin_user_id, ability_id: 1})
|> Trento.Repo.insert!(on_conflict: :nothing)

%Trento.Settings.ApiKeySettings{}
|> Trento.Settings.ApiKeySettings.changeset(%{
  jti: UUID.uuid4(),
  created_at: DateTime.utc_now()
})
|> Trento.Repo.insert!(on_conflict: :nothing)

Trento.Repo.insert!(Trento.ActivityLog.Settings.with_default_retention_time(),
  on_conflict: :nothing
)
