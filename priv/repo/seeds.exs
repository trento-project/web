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

%Trento.Settings.ApiKeySettings{}
|> Trento.Settings.ApiKeySettings.changeset(%{
  jti: UUID.uuid4(),
  created_at: DateTime.utc_now()
})
|> Trento.Repo.insert!(on_conflict: :nothing)

Trento.Repo.insert!(Trento.ActivityLog.Settings.with_default_retention_time(),
  on_conflict: :nothing
)
