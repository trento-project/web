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

import Tronto.Seeds.Helpers

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
  fn index ->
    %{
      host_id: generate_sequential_uuid(index),
      hostname: Faker.StarWars.character() |> Macro.underscore() |> String.replace(" ", ""),
      ip_addresses: [Faker.Internet.ip_v4_address()],
      agent_version: agent_version
    }
    |> Tronto.Monitoring.Domain.Commands.RegisterHost.new!()
    |> Tronto.Commanded.dispatch()
  end
)

Enum.each(
  6..11,
  fn index ->
    %{
      cluster_id: generate_sequential_uuid(index),
      host_id: generate_sequential_uuid(index - 6),
      name: Faker.StarWars.character() |> Macro.underscore() |> String.replace(" ", ""),
      sid: "PRD",
      type: :hana_scale_up
    }
    |> Tronto.Monitoring.Domain.Commands.RegisterCluster.new!()
    |> Tronto.Commanded.dispatch()
  end
)
