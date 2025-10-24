defmodule TrentoWeb.V1.PersonalAccessTokensViewJSONTest do
  use ExUnit.Case

  alias Trento.PersonalAccessTokens.PersonalAccessToken

  alias TrentoWeb.V1.PersonalAccessTokensJSON

  import Trento.Factory

  describe "rendering a list of PATs" do
    test "should render an empty list of personal access tokens" do
      %{personal_access_tokens: not_loaded_personal_access_tokens} = build(:user)

      assert [] ==
               PersonalAccessTokensJSON.personal_access_tokens(not_loaded_personal_access_tokens)

      assert [] == PersonalAccessTokensJSON.personal_access_tokens([])
    end

    test "should render a list of personal access tokens" do
      id1 = Faker.UUID.v4()
      name1 = Faker.Lorem.word()
      created_at1 = Faker.DateTime.backward(1)
      expires_at1 = nil

      id2 = Faker.UUID.v4()
      name2 = Faker.StarWars.character()
      created_at2 = Faker.DateTime.backward(2)
      expires_at2 = Faker.DateTime.forward(3)

      id3 = Faker.UUID.v4()
      name3 = Faker.StarWars.character()
      created_at3 = Faker.DateTime.backward(3)
      expires_at3 = Faker.DateTime.forward(4)

      personal_access_tokens = [
        build(:personal_access_token,
          id: id1,
          name: name1,
          created_at: created_at1,
          expires_at: expires_at1
        ),
        build(:personal_access_token,
          id: id2,
          name: name2,
          created_at: created_at2,
          expires_at: expires_at2
        ),
        build(:personal_access_token,
          id: id3,
          name: name3,
          created_at: created_at3,
          expires_at: expires_at3
        )
      ]

      assert [
               %{
                 id: id1,
                 name: name1,
                 created_at: created_at1,
                 expires_at: expires_at1
               },
               %{
                 id: id2,
                 name: name2,
                 created_at: created_at2,
                 expires_at: expires_at2
               },
               %{
                 id: id3,
                 name: name3,
                 created_at: created_at3,
                 expires_at: expires_at3
               }
             ] ==
               PersonalAccessTokensJSON.personal_access_tokens(personal_access_tokens)
    end
  end

  describe "rendering a newly created token" do
    scenarios = [
      %{
        name: "without expiration date",
        factory_options: [
          name: Faker.Lorem.word(),
          created_at: Faker.DateTime.backward(1),
          expires_at: nil
        ]
      },
      %{
        name: "with expiration date",
        factory_options: [
          name: Faker.Lorem.word(),
          created_at: Faker.DateTime.backward(2),
          expires_at: Faker.DateTime.forward(3)
        ]
      }
    ]

    for %{name: scenario_name, factory_options: factory_options} <- scenarios do
      @pat_factory_options factory_options

      test "should render a new personal access token #{scenario_name}" do
        %PersonalAccessToken{
          id: pat_id,
          name: name,
          created_at: created_at,
          expires_at: expires_at
        } = personal_access_token = build(:personal_access_token, @pat_factory_options)

        assert %{
                 id: pat_id,
                 name: name,
                 created_at: created_at,
                 expires_at: expires_at,
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
