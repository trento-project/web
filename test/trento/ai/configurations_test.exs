defmodule Trento.Ai.ConfigurationsTest do
  use Trento.DataCase, async: true
  use Trento.AI.AICase

  alias Trento.Users.User

  alias Trento.AI.{Configurations, UserConfiguration}

  import Trento.Factory

  import Mox

  setup :verify_on_exit!

  describe "creating a user AI configuration" do
    test "should not allow creating AI configuration for a deleted or disabled user" do
      deleted_user = insert(:user, deleted_at: Faker.DateTime.backward(3))
      disabled_user = insert(:user, locked_at: Faker.DateTime.backward(3))

      for user <- [deleted_user, disabled_user] do
        assert {:error, :forbidden} ==
                 Configurations.create_user_configuration(
                   user,
                   build(:ai_configuration_creation_params)
                 )
      end
    end

    test "should not allow creating AI configuration for a user without identifier" do
      user = %User{}

      assert {:error,
              %Ecto.Changeset{errors: [user_id: {"can't be blank", [validation: :required]}]}} =
               Configurations.create_user_configuration(
                 user,
                 build(:ai_configuration_creation_params)
               )
    end

    test "should not allow creating AI configuration for a non existent user" do
      user = %User{id: 124}

      assert {:error, %Ecto.Changeset{errors: [user_id: {"User does not exist", _}]}} =
               Configurations.create_user_configuration(
                 user,
                 build(:ai_configuration_creation_params)
               )
    end

    failing_validation_scenarios = [
      %{
        name: "empty attributes",
        attrs: %{},
        expected_errors: [
          model: {"can't be blank", [validation: :required]},
          provider: {"can't be blank", [validation: :required]},
          api_key: {"can't be blank", [validation: :required]}
        ]
      },
      %{
        name: "missing provider",
        attrs: %{
          model: build(:random_ai_model),
          api_key: Faker.String.base64()
        },
        expected_errors: [
          provider: {"can't be blank", [validation: :required]}
        ]
      },
      %{
        name: "empty provider",
        attrs_sceanarios:
          Enum.map(
            [nil, "", "  "],
            &%{
              provider: &1,
              model: build(:random_ai_model),
              api_key: Faker.String.base64()
            }
          ),
        expected_errors: [
          provider: {"can't be blank", [validation: :required]}
        ]
      },
      %{
        name: "missing model",
        attrs: %{
          provider: build(:random_ai_provider),
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
              provider: build(:random_ai_provider),
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
              provider: build(:random_ai_provider),
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
          provider: build(:random_ai_provider),
          api_key: Faker.String.base64()
        },
        expected_errors: [
          model: {"is not supported", [validation: :ai_model_validity]}
        ]
      },
      %{
        name: "model unsupported by the specified provider",
        attrs: %{
          provider: :googleai,
          model: "gpt-5.4",
          api_key: Faker.String.base64()
        },
        expected_errors: [
          model:
            {"is not supported by the specified provider",
             [validation: :ai_model_provider_mismatch]}
        ]
      },
      %{
        name: "missing api key",
        attrs: %{
          provider: :googleai,
          model: build(:random_ai_model, provider: :googleai)
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
              provider: :openai,
              model: build(:random_ai_model, provider: :openai),
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
              provider: :anthropic,
              model: build(:random_ai_model, provider: :anthropic),
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

    test "should fail creating AI configuration when the provider is not among the supported ones" do
      %User{id: user_id} = user = insert(:user)

      unsuppoerted_providers = [:unsupported_provider, Faker.Lorem.word(), 123, true, %{}, []]

      for unsuppoerted_provider <- unsuppoerted_providers do
        assert {:error,
                %Ecto.Changeset{
                  errors: [
                    provider:
                      {"is invalid",
                       [
                         type: _,
                         validation: :inclusion,
                         enum: ["anthropic", "googleai", "openai" | _]
                       ]}
                  ]
                }} =
                 Configurations.create_user_configuration(user, %{
                   provider: unsuppoerted_provider,
                   model: build(:random_ai_model),
                   api_key: Faker.String.base64()
                 })

        assert nil == load_ai_config(user_id)
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
                 build(:ai_configuration_creation_params)
               )
    end

    test "should allow creating AI configuration with valid data" do
      %User{id: user_id} = user = insert(:user)

      provider = build(:random_ai_provider)
      model = build(:random_ai_model, provider: provider)
      api_key = Faker.String.base64()

      assert {:ok,
              %UserConfiguration{
                model: ^model,
                provider: ^provider,
                api_key: ^api_key,
                user_id: ^user_id
              } = created_config} =
               Configurations.create_user_configuration(
                 user,
                 build(:ai_configuration_creation_params,
                   provider: provider,
                   model: model,
                   api_key: api_key
                 )
               )

      assert ^created_config = load_ai_config(user_id)
    end

    test "should support creating AI configuration with a model that is supported by multiple providers" do
      %User{id: user_id1} = user1 = insert(:user)

      assert {:ok,
              %UserConfiguration{
                model: "model1",
                provider: :provider1,
                api_key: _api_key,
                user_id: ^user_id1
              } = created_config1} =
               Configurations.create_user_configuration(
                 user1,
                 build(:ai_configuration_creation_params,
                   provider: :provider1,
                   model: "model1"
                 )
               )

      assert ^created_config1 = load_ai_config(user_id1)

      %User{id: user_id2} = user2 = insert(:user)

      assert {:ok,
              %UserConfiguration{
                model: "model1",
                provider: :provider2,
                api_key: _api_key,
                user_id: ^user_id2
              } = created_config2} =
               Configurations.create_user_configuration(
                 user2,
                 build(:ai_configuration_creation_params,
                   provider: :provider2,
                   model: "model1"
                 )
               )

      assert ^created_config2 = load_ai_config(user_id2)
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
                   build(:ai_configuration_creation_params)
                 )

        assert %UserConfiguration{} = load_ai_config(user_id)
      end
    end

    test "should not allow updating AI configuration for a user without identifier" do
      user = %User{}

      assert {:error, :forbidden} =
               Configurations.update_user_configuration(
                 user,
                 build(:ai_configuration_creation_params)
               )
    end

    test "should not allow updating AI configuration for a non existent user" do
      user = %User{id: 124}

      assert {:error, :not_found} =
               Configurations.update_user_configuration(
                 user,
                 build(:ai_configuration_creation_params)
               )
    end

    test "should not allow updating AI configuration for a user that does not have one" do
      %User{} = user = insert(:user)

      assert {:error, :not_found} =
               Configurations.update_user_configuration(
                 user,
                 build(:ai_configuration_creation_params)
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
        name: "model unsupported by the specified provider",
        attrs: %{
          provider: :googleai,
          model: "gpt-5.4"
        },
        expected_errors: [
          model:
            {"is not supported by the specified provider",
             [validation: :ai_model_provider_mismatch]}
        ]
      },
      %{
        name: "empty provider",
        attrs_sceanarios:
          Enum.map(
            [nil, "", "  "],
            &%{
              provider: &1,
              model: build(:random_ai_model),
              api_key: Faker.String.base64()
            }
          ),
        expected_errors: [
          provider: {"can't be blank", [validation: :required]}
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

        expected_errors = Map.get(@failing_update_validation_scenario, :expected_errors, [])

        expected_errors_scenarios =
          Map.get(@failing_update_validation_scenario, :expected_errors_scenarios, [
            expected_errors
          ])

        attrs = Map.get(@failing_update_validation_scenario, :attrs, %{})
        attrs_scenarios = Map.get(@failing_update_validation_scenario, :attrs_sceanarios, [attrs])

        for {resolved_scenario, index} <- Enum.with_index(attrs_scenarios) do
          resolved_expected_errors = Enum.at(expected_errors_scenarios, index, expected_errors)

          assert {:error, %Ecto.Changeset{errors: ^resolved_expected_errors}} =
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

    test "should fail updating only the provider" do
      %User{id: user_id} = user = insert(:user)

      %UserConfiguration{
        model: initial_model,
        provider: initial_provider,
        api_key: initial_api_key
      } =
        insert(:ai_user_configuration,
          user_id: user_id,
          provider: :googleai,
          model: build(:random_ai_model, provider: :googleai)
        )

      new_provider = :openai

      assert {:error,
              %Ecto.Changeset{
                errors: [
                  model:
                    {"is not supported by the specified provider",
                     [validation: :ai_model_provider_mismatch]}
                ]
              }} =
               Configurations.update_user_configuration(user, %{
                 provider: new_provider
               })

      assert %UserConfiguration{
               model: ^initial_model,
               provider: ^initial_provider,
               api_key: ^initial_api_key
             } = load_ai_config(user_id)
    end

    test "should allow updating only the model" do
      %User{id: user_id} = user = insert(:user)

      %UserConfiguration{
        model: _initial_model,
        provider: initial_provider,
        api_key: initial_api_key
      } = insert(:ai_user_configuration, user_id: user_id)

      new_model = build(:random_ai_model, provider: initial_provider)

      assert {:ok,
              %UserConfiguration{
                model: ^new_model,
                provider: ^initial_provider,
                api_key: ^initial_api_key,
                user_id: ^user_id
              } = updated_config} =
               Configurations.update_user_configuration(user, %{
                 model: new_model
               })

      assert ^updated_config = load_ai_config(user_id)
    end

    test "should allow updating only the api key" do
      %User{id: user_id} = user = insert(:user)

      %UserConfiguration{
        model: initial_model,
        provider: initial_provider,
        api_key: _initial_api_key
      } = insert(:ai_user_configuration, user_id: user_id)

      new_api_key = Faker.String.base64()

      assert {:ok,
              %UserConfiguration{
                model: ^initial_model,
                provider: ^initial_provider,
                api_key: ^new_api_key,
                user_id: ^user_id
              } = updated_config} =
               Configurations.update_user_configuration(user, %{
                 api_key: new_api_key
               })

      assert ^updated_config = load_ai_config(user_id)
    end

    test "should allow updating AI configuration with valid data" do
      %User{id: user_id} = user = insert(:user)

      insert(:ai_user_configuration, user_id: user_id)

      new_provider = build(:random_ai_provider)
      new_model = build(:random_ai_model, provider: new_provider)
      new_api_key = Faker.String.base64()

      assert {:ok,
              %UserConfiguration{
                model: ^new_model,
                provider: ^new_provider,
                api_key: ^new_api_key,
                user_id: ^user_id
              } = updated_config} =
               Configurations.update_user_configuration(
                 user,
                 build(:ai_configuration_creation_params,
                   provider: new_provider,
                   model: new_model,
                   api_key: new_api_key
                 )
               )

      assert ^updated_config = load_ai_config(user_id)
    end
  end

  defp load_ai_config(user_id),
    do: Trento.Repo.get_by(UserConfiguration, user_id: user_id)
end
