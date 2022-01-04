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
  confirm_password: "secret1234"
})
|> Tronto.Repo.insert!()

agent_version = Faker.App.semver()
Enum.each(
  0..5,
  fn _ ->
    %{
      id_host: Faker.UUID.v4(),
      hostname: Faker.StarWars.character() |> Macro.underscore() |> String.replace(" ", ""),
      ip_addresses: [Faker.Internet.ip_v4_address()],
      agent_version: agent_version,
    }
    |> Tronto.Monitoring.Domain.Commands.RegisterHost.new!()
    |> Tronto.Commanded.dispatch()
  end
)
