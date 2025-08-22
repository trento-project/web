defmodule TrentoWeb.V1.ApiKeysViewJSONTest do
  use ExUnit.Case

  alias Trento.Users.ApiKey
  alias TrentoWeb.V1.ApiKeysJSON

  import Trento.Factory

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
