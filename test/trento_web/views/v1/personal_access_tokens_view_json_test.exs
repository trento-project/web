defmodule TrentoWeb.V1.PersonalAccessTokensViewJSONTest do
  use ExUnit.Case

  alias Trento.Users.PersonalAccessToken
  alias TrentoWeb.V1.PersonalAccessTokensJSON

  import Trento.Factory

  describe "rendering a newly created token" do
    scenarios = [
      %{
        name: "without expiration date",
        factory_options: [
          name: Faker.Lorem.word(),
          created_at: Faker.DateTime.backward(1),
          expire_at: nil
        ]
      },
      %{
        name: "with expiration date",
        factory_options: [
          name: Faker.Lorem.word(),
          created_at: Faker.DateTime.backward(2),
          expire_at: Faker.DateTime.forward(3)
        ]
      }
    ]

    for %{name: scenario_name, factory_options: factory_options} <- scenarios do
      @pat_factory_options factory_options

      test "should render a new personal access token #{scenario_name}" do
        %PersonalAccessToken{
          jti: jti,
          name: name,
          created_at: created_at,
          expire_at: expire_at
        } = personal_access_token = build(:personal_access_token, @pat_factory_options)

        assert %{
                 jti: jti,
                 name: name,
                 created_at: created_at,
                 expire_at: expire_at,
                 access_token: "<generated_token>"
               } ==
                 PersonalAccessTokensJSON.new_personal_access_token(%{
                   personal_access_token: personal_access_token,
                   generated_token: "<generated_token>"
                 })
      end
    end
  end
end
