# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Tronto.Repo.insert!(%Tronto.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

%Tronto.Accounts.User{}
|> Tronto.Accounts.User.changeset(%{
  email: "chiecks@tronto.io",
  password: "secret1234",
  confirm_password: "secret1234"})
|> Tronto.Repo.insert!()
