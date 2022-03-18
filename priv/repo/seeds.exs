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

FunWithFlags.enable(:convert_agent_ids)

%Trento.User{}
|> Trento.User.changeset(%{
  email: "chiecks@trento.io",
  password: "secret1234",
  confirm_password: "secret1234"
})
|> Trento.Repo.insert!()
