defmodule Trento.Ai.ConfigurationsTest do
  use Trento.DataCase, async: true
  use Trento.AI.AICase

  alias Trento.Users.User

  alias Trento.AI.{Configurations, LLMRegistry, UserConfiguration}

  alias Trento.Factory

  import Trento.Factory

  describe "creating a user AI configuration" do
    test "should not allow creating AI configuration for a deleted or disabled user" do
      deleted_user = insert(:user, deleted_at: Faker.DateTime.backward(3))
      disabled_user = insert(:user, locked_at: Faker.DateTime.backward(3))

      for user <- [deleted_user, disabled_user] do
        assert {:error, :forbidden} ==
                 Configurations.create_user_configuration(
                   user,
                   %{
                     model: Factory.random_ai_model(),
                     api_key: Faker.String.base64()
                   }
                 )
      end
    end

    test "should not allow creating AI configuration for a user without identifier" do
      user = %User{}

      assert {:error,
              %Ecto.Changeset{errors: [user_id: {"can't be blank", [validation: :required]}]}} =
               Configurations.create_user_configuration(
                 user,
                 %{
                   model: Factory.random_ai_model(),
                   api_key: Faker.String.base64()
                 }
               )
    end

    test "should not allow creating AI configuration for a non existent user" do
      user = %User{id: 124}

      assert {:error, %Ecto.Changeset{errors: [user_id: {"User does not exist", _}]}} =
               Configurations.create_user_configuration(
                 user,
                 %{
                   model: Factory.random_ai_model(),
                   api_key: Faker.String.base64()
                 }
               )
    end

    failing_validation_scenarios = [
      %{
        name: "empty attributes",
        attrs: %{},
        expected_errors: [
          model: {"can't be blank", [validation: :required]},
          api_key: {"can't be blank", [validation: :required]}
        ]
      },
      %{
        name: "missing model",
        attrs: %{
          api_key: Faker.String.base64()
        },
        expected_errors: [
          model: {"can't be blank", [validation: :required]}
        ]
      },
      %{
        name: "empty model",
        attrs_sceanarios:
          Enum.map(
            [nil, "", "  "],
            &%{
              model: &1,
              api_key: Faker.String.base64()
            }
          ),
        expected_errors: [
          model: {"can't be blank", [validation: :required]}
        ]
      },
      %{
        name: "non string model",
        attrs_sceanarios:
          Enum.map(
            [123, true, %{}, []],
            &%{
              model: &1,
              api_key: Faker.String.base64()
            }
          ),
        expected_errors: [
          model: {"is invalid", [type: :string, validation: :cast]}
        ]
      },
      %{
        name: "unsupported model",
        attrs: %{
          model: Faker.Lorem.word(),
          api_key: Faker.String.base64()
        },
        expected_errors: [
          model: {"is not supported", [validation: :ai_model_validity]}
        ]
      },
      %{
        name: "missing api key",
        attrs: %{
          model: Factory.random_ai_model()
        },
        expected_errors: [
          api_key: {"can't be blank", [validation: :required]}
        ]
      },
      %{
        name: "empty api key",
        attrs_sceanarios:
          Enum.map(
            [nil, "", "  "],
            &%{
              model: Factory.random_ai_model(),
              api_key: &1
            }
          ),
        expected_errors: [
          api_key: {"can't be blank", [validation: :required]}
        ]
      },
      %{
        name: "non string api key",
        attrs_sceanarios:
          Enum.map(
            [123, true, %{}, []],
            &%{
              model: Factory.random_ai_model(),
              api_key: &1
            }
          ),
        expected_errors: [
          api_key: {"is invalid", [type: Trento.Support.Ecto.EncryptedBinary, validation: :cast]}
        ]
      }
    ]

    for %{name: name} = failing_validation_scenario <- failing_validation_scenarios do
      @failing_validation_scenario failing_validation_scenario

      test "should not allow creating AI configuration with invalid data - #{name}" do
        %User{id: user_id} = user = insert(:user)

        %{expected_errors: expected_errors} = @failing_validation_scenario

        attrs = Map.get(@failing_validation_scenario, :attrs, %{})
        attrs_scenarios = Map.get(@failing_validation_scenario, :attrs_sceanarios, [attrs])

        for resolved_scenario <- attrs_scenarios do
          assert {:error, %Ecto.Changeset{errors: ^expected_errors}} =
                   Configurations.create_user_configuration(user, resolved_scenario)

          assert nil == load_ai_config(user_id)
        end
      end
    end

    test "should not allow creating AI configuration for a user that already has one" do
      %User{id: user_id} = user = insert(:user)

      insert(:ai_user_configuration, user_id: user_id)

      assert {:error,
              %Ecto.Changeset{
                errors: [
                  user_id: {"User already has a configuration", _}
                ]
              }} =
               Configurations.create_user_configuration(
                 user,
                 %{
                   model: random_ai_model(),
                   api_key: Faker.String.base64()
                 }
               )
    end

    test "should allow creating AI configuration with valid data" do
      %User{id: user_id} = user = insert(:user)

      model = Factory.random_ai_model()
      api_key = Faker.String.base64()

      expected_provider = LLMRegistry.get_model_provider(model)

      assert {:ok,
              %UserConfiguration{
                model: ^model,
                provider: ^expected_provider,
                api_key: ^api_key,
                user_id: ^user_id
              } = created_config} =
               Configurations.create_user_configuration(user, %{model: model, api_key: api_key})

      assert ^created_config = load_ai_config(user_id)
    end
  end

  describe "updating a user AI configuration" do
    test "should not allow updating AI configuration for a deleted or disabled user" do
      %User{id: deleted_user_id} =
        deleted_user = insert(:user, deleted_at: Faker.DateTime.backward(3))

      %User{id: disabled_user_id} =
        disabled_user = insert(:user, locked_at: Faker.DateTime.backward(3))

      insert(:ai_user_configuration, user_id: deleted_user_id)
      insert(:ai_user_configuration, user_id: disabled_user_id)

      for %User{id: user_id} = user <- [deleted_user, disabled_user] do
        assert {:error, :forbidden} ==
                 Configurations.update_user_configuration(
                   user,
                   %{model: Factory.random_ai_model(), api_key: Faker.String.base64()}
                 )

        assert %UserConfiguration{} = load_ai_config(user_id)
      end
    end

    test "should not allow updating AI configuration for a user without identifier" do
      user = %User{}

      assert {:error, :forbidden} =
               Configurations.update_user_configuration(
                 user,
                 %{model: Factory.random_ai_model(), api_key: Faker.String.base64()}
               )
    end

    test "should not allow updating AI configuration for a non existent user" do
      user = %User{id: 124}

      assert {:error, :not_found} =
               Configurations.update_user_configuration(
                 user,
                 %{model: Factory.random_ai_model(), api_key: Faker.String.base64()}
               )
    end

    test "should not allow updating AI configuration for a user that does not have one" do
      %User{} = user = insert(:user)

      assert {:error, :not_found} =
               Configurations.update_user_configuration(
                 user,
                 %{model: Factory.random_ai_model(), api_key: Faker.String.base64()}
               )
    end

    failing_update_validation_scenarios = [
      %{
        name: "empty model",
        attrs_sceanarios: Enum.map([nil, "", "  "], &%{model: &1}),
        expected_errors: [
          model: {"can't be blank", [validation: :required]}
        ]
      },
      %{
        name: "non string model",
        attrs_sceanarios: Enum.map([123, true, %{}, []], &%{model: &1}),
        expected_errors: [
          model: {"is invalid", [type: :string, validation: :cast]}
        ]
      },
      %{
        name: "unsupported model",
        attrs: %{
          model: Faker.Lorem.word()
        },
        expected_errors: [
          model: {"is not supported", [validation: :ai_model_validity]}
        ]
      },
      %{
        name: "empty api key",
        attrs_sceanarios: Enum.map([nil, "", "  "], &%{api_key: &1}),
        expected_errors: [
          api_key: {"can't be blank", [validation: :required]}
        ]
      },
      %{
        name: "non string api key",
        attrs_sceanarios: Enum.map([123, true, %{}, []], &%{api_key: &1}),
        expected_errors: [
          api_key: {"is invalid", [type: Trento.Support.Ecto.EncryptedBinary, validation: :cast]}
        ]
      },
      %{
        name: "combined invalid model and api key",
        attrs: %{
          model: Faker.Lorem.word(),
          api_key: 32
        },
        expected_errors: [
          model: {"is not supported", [validation: :ai_model_validity]},
          api_key: {"is invalid", [type: Trento.Support.Ecto.EncryptedBinary, validation: :cast]}
        ]
      }
    ]

    for %{name: name} = failing_update_validation_scenario <- failing_update_validation_scenarios do
      @failing_update_validation_scenario failing_update_validation_scenario

      test "should not allow updating AI configuration with invalid data - #{name}" do
        %User{id: user_id} = user = insert(:user)

        %UserConfiguration{
          model: initial_model,
          provider: initial_provider,
          api_key: initial_api_key
        } = insert(:ai_user_configuration, user_id: user_id)

        %{expected_errors: expected_errors} = @failing_update_validation_scenario

        attrs = Map.get(@failing_update_validation_scenario, :attrs, %{})
        attrs_scenarios = Map.get(@failing_update_validation_scenario, :attrs_sceanarios, [attrs])

        for resolved_scenario <- attrs_scenarios do
          assert {:error, %Ecto.Changeset{errors: ^expected_errors}} =
                   Configurations.update_user_configuration(user, resolved_scenario)

          assert %UserConfiguration{
                   user_id: ^user_id,
                   model: ^initial_model,
                   provider: ^initial_provider,
                   api_key: ^initial_api_key
                 } = load_ai_config(user_id)
        end
      end
    end

    test "should allow updating only the model" do
      %User{id: user_id} = user = insert(:user)

      %UserConfiguration{
        model: _initial_model,
        provider: _initial_provider,
        api_key: initial_api_key
      } = insert(:ai_user_configuration, user_id: user_id)

      new_model = Factory.random_ai_model()

      expected_provider = LLMRegistry.get_model_provider(new_model)

      assert {:ok,
              %UserConfiguration{
                model: ^new_model,
                provider: ^expected_provider,
                api_key: ^initial_api_key,
                user_id: ^user_id
              } = updated_config} =
               Configurations.update_user_configuration(user, %{
                 model: new_model
               })

      assert ^updated_config = load_ai_config(user_id)
    end

    test "should allow updating AI configuration with valid data" do
      %User{id: user_id} = user = insert(:user)

      insert(:ai_user_configuration, user_id: user_id)

      new_model = Factory.random_ai_model()
      new_api_key = Faker.String.base64()

      expected_provider = LLMRegistry.get_model_provider(new_model)

      assert {:ok,
              %UserConfiguration{
                model: ^new_model,
                provider: ^expected_provider,
                api_key: ^new_api_key,
                user_id: ^user_id
              } = updated_config} =
               Configurations.update_user_configuration(user, %{
                 model: new_model,
                 api_key: new_api_key
               })

      assert ^updated_config = load_ai_config(user_id)
    end
  end

  defp load_ai_config(user_id),
    do: Trento.Repo.get_by(UserConfiguration, user_id: user_id)
end
