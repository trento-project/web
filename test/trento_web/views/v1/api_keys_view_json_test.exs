defmodule TrentoWeb.V1.ApiKeysViewJSONTest do
  use ExUnit.Case

  alias Trento.Users.ApiKey
  alias TrentoWeb.V1.ApiKeysJSON

  import Trento.Factory

  describe "rendering a list of keys" do
    test "should render an empty list of api keys" do
      assert [] == ApiKeysJSON.api_keys(%{api_keys: []})
    end

    test "should render a list of api keys" do
      name1 = Faker.Lorem.word()
      created_at1 = Faker.DateTime.backward(1)
      expire_at1 = nil

      name2 = Faker.StarWars.character()
      created_at2 = Faker.DateTime.backward(2)
      expire_at2 = Faker.DateTime.forward(3)

      name3 = Faker.StarWars.character()
      created_at3 = Faker.DateTime.backward(3)
      expire_at3 = Faker.DateTime.forward(4)

      api_keys = [
        build(:api_key, name: name1, created_at: created_at1, expire_at: expire_at1),
        build(:api_key, name: name2, created_at: created_at2, expire_at: expire_at2),
        build(:api_key, name: name3, created_at: created_at3, expire_at: expire_at3)
      ]

      assert [
               %{
                 name: name1,
                 created_at: created_at1,
                 expire_at: expire_at1
               },
               %{
                 name: name2,
                 created_at: created_at2,
                 expire_at: expire_at2
               },
               %{
                 name: name3,
                 created_at: created_at3,
                 expire_at: expire_at3
               }
             ] == ApiKeysJSON.api_keys(%{api_keys: api_keys})
    end
  end

  describe "rendering a newly created key" do
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
      @key_factory_options factory_options

      test "should render a new api key #{scenario_name}" do
        %ApiKey{
          name: name,
          created_at: created_at,
          expire_at: expire_at
        } = api_key = build(:api_key, @key_factory_options)

        assert %{
                 name: name,
                 created_at: created_at,
                 expire_at: expire_at,
                 access_token: "<generated_token>"
               } ==
                 ApiKeysJSON.new_api_key(%{api_key: api_key, generated_token: "<generated_token>"})
      end
    end
  end
end
