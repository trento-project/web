defmodule TrentoWeb.V1.AIConfigurationControllerTest do
  use TrentoWeb.ConnCase, async: true
  use Trento.AI.AICase

  alias Trento.AI.UserConfiguration

  import Trento.Factory
  import OpenApiSpex.TestAssertions
  import Trento.Support.Helpers.AbilitiesTestHelper

  setup :setup_api_spec_v1
  setup :setup_user

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "content-type", "application/json")}
  end

  describe "creating AI configuration" do
    failing_validation_scenarios = [
      %{
        name: "empty payload",
        request_body_scenarios: [
          %{},
          nil,
          ""
        ],
        expected_errors: [
          %{
            "detail" => "Missing field: provider",
            "source" => %{"pointer" => "/provider"},
            "title" => "Invalid value"
          },
          %{
            "detail" => "Missing field: model",
            "source" => %{"pointer" => "/model"},
            "title" => "Invalid value"
          },
          %{
            "detail" => "Missing field: api_key",
            "source" => %{"pointer" => "/api_key"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "missing provider",
        request_body: %{
          model: build(:random_ai_model),
          api_key: Faker.String.base64(32)
        },
        expected_errors: [
          %{
            "detail" => "Missing field: provider",
            "source" => %{"pointer" => "/provider"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "nil provider",
        request_body: %{
          model: build(:random_ai_model),
          provider: nil,
          api_key: Faker.String.base64(32)
        },
        expected_errors: [
          %{
            "detail" => "null value where string expected",
            "source" => %{"pointer" => "/provider"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "empty provider",
        request_body_scenarios:
          Enum.map(
            ["", "  "],
            &%{
              model: build(:random_ai_model),
              provider: &1,
              api_key: Faker.String.base64(32)
            }
          ),
        expected_errors: [
          %{
            "detail" => "can't be blank",
            "source" => %{"pointer" => "/provider"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "unsupported provider",
        request_body: %{
          model: build(:random_ai_model),
          provider: Faker.Lorem.word(),
          api_key: Faker.String.base64(32)
        },
        expected_errors: [
          %{
            "detail" => "is invalid",
            "source" => %{"pointer" => "/provider"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "non string provider",
        request_body_scenarios:
          Enum.map(
            [123, true, %{}, []],
            &%{
              model: build(:random_ai_model),
              provider: &1,
              api_key: Faker.String.base64()
            }
          ),
        expected_errors_scenarios:
          Enum.map(
            ["integer", "boolean", "object", "array"],
            &[
              %{
                "detail" => "Invalid string. Got: #{&1}",
                "source" => %{"pointer" => "/provider"},
                "title" => "Invalid value"
              }
            ]
          )
      },
      %{
        name: "missing model",
        request_body: %{
          provider: build(:random_ai_provider),
          api_key: Faker.String.base64(32)
        },
        expected_errors: [
          %{
            "detail" => "Missing field: model",
            "source" => %{"pointer" => "/model"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "nil model",
        request_body: %{
          model: nil,
          provider: build(:random_ai_provider),
          api_key: Faker.String.base64()
        },
        expected_errors: [
          %{
            "detail" => "null value where string expected",
            "source" => %{"pointer" => "/model"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "empty model",
        request_body_scenarios:
          Enum.map(
            ["", "  "],
            &%{
              model: &1,
              provider: build(:random_ai_provider),
              api_key: Faker.String.base64()
            }
          ),
        expected_errors: [
          %{
            "detail" => "can't be blank",
            "source" => %{"pointer" => "/model"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "non string model",
        request_body_scenarios:
          Enum.map(
            [123, true, %{}, []],
            &%{
              model: &1,
              provider: build(:random_ai_provider),
              api_key: Faker.String.base64()
            }
          ),
        expected_errors_scenarios:
          Enum.map(
            ["integer", "boolean", "object", "array"],
            &[
              %{
                "detail" => "Invalid string. Got: #{&1}",
                "source" => %{"pointer" => "/model"},
                "title" => "Invalid value"
              }
            ]
          )
      },
      %{
        name: "unsupported model",
        request_body: %{
          model: "unsupported-model",
          provider: build(:random_ai_provider),
          api_key: Faker.String.base64()
        },
        expected_errors: [
          %{
            "detail" => "is not supported",
            "source" => %{"pointer" => "/model"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "model unsupported by the specified provider",
        request_body: %{
          model: build(:random_ai_model, provider: :googleai),
          provider: :openai,
          api_key: Faker.String.base64()
        },
        expected_errors: [
          %{
            "detail" => "is not supported by the specified provider",
            "source" => %{"pointer" => "/model"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "missing api_key",
        request_body: %{
          model: build(:random_ai_model),
          provider: build(:random_ai_provider)
        },
        expected_errors: [
          %{
            "detail" => "Missing field: api_key",
            "source" => %{"pointer" => "/api_key"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "nil api_key",
        request_body: %{
          model: build(:random_ai_model),
          provider: build(:random_ai_provider),
          api_key: nil
        },
        expected_errors: [
          %{
            "detail" => "null value where string expected",
            "source" => %{"pointer" => "/api_key"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "empty api_key",
        request_body_scenarios:
          Enum.map(
            [nil, "", "  "],
            fn empty_api_key ->
              provider = build(:random_ai_provider)
              model = build(:random_ai_model, provider: provider)

              %{
                model: model,
                provider: provider,
                api_key: empty_api_key
              }
            end
          ),
        expected_errors_scenarios:
          Enum.map([nil, "", "  "], fn empty_api_key ->
            expected_detail =
              case empty_api_key do
                nil -> "null value where string expected"
                _ -> "can't be blank"
              end

            [
              %{
                "detail" => expected_detail,
                "source" => %{"pointer" => "/api_key"},
                "title" => "Invalid value"
              }
            ]
          end)
      },
      %{
        name: "non string api_key",
        request_body_scenarios:
          Enum.map(
            [123, true, %{}, []],
            fn non_string_api_key ->
              provider = build(:random_ai_provider)
              model = build(:random_ai_model, provider: provider)

              %{
                model: model,
                provider: provider,
                api_key: non_string_api_key
              }
            end
          ),
        expected_errors_scenarios:
          Enum.map(
            ["integer", "boolean", "object", "array"],
            &[
              %{
                "detail" => "Invalid string. Got: #{&1}",
                "source" => %{"pointer" => "/api_key"},
                "title" => "Invalid value"
              }
            ]
          )
      }
    ]

    for %{name: name} = failing_validation_scenario <- failing_validation_scenarios do
      @failing_validation_scenario failing_validation_scenario

      test "should fail to create a new AI configuration with invalid data - #{name}", %{
        conn: conn,
        api_spec: api_spec
      } do
        expected_errors = Map.get(@failing_validation_scenario, :expected_errors, [])

        expected_errors_scenarios =
          Map.get(@failing_validation_scenario, :expected_errors_scenarios, [expected_errors])

        request_body = Map.get(@failing_validation_scenario, :request_body, %{})

        request_body_scenarios =
          Map.get(@failing_validation_scenario, :request_body_scenarios, [request_body])

        for {resolved_scenario, index} <- Enum.with_index(request_body_scenarios) do
          resolved_expected_errors = Enum.at(expected_errors_scenarios, index, expected_errors)

          response =
            conn
            |> post("/api/v1/profile/ai_configuration", resolved_scenario)
            |> json_response(:unprocessable_entity)

          assert_schema(response, "UnprocessableEntityV1", api_spec)

          assert %{
                   "errors" => resolved_expected_errors
                 } == response
        end
      end
    end

    test "should fail to create a new AI configuration for a user that already has one", %{
      conn: conn,
      api_spec: api_spec,
      admin_user: %{id: user_id}
    } do
      insert(:ai_user_configuration, user_id: user_id)

      payload = build(:ai_configuration_creation_params)

      response =
        conn
        |> post("/api/v1/profile/ai_configuration", payload)
        |> json_response(:unprocessable_entity)

      assert_schema(response, "UnprocessableEntityV1", api_spec)

      assert %{
               "errors" => [
                 %{
                   "detail" => "User already has a configuration",
                   "source" => %{"pointer" => "/user_id"},
                   "title" => "Invalid value"
                 }
               ]
             } == response
    end

    test "should create an AI configuration for the user", %{
      conn: conn,
      api_spec: api_spec
    } do
      %{provider: provider, model: model, api_key: _} =
        creation_params = build(:ai_configuration_creation_params)

      expected_provider = Atom.to_string(provider)

      response =
        conn
        |> post("/api/v1/profile/ai_configuration", creation_params)
        |> json_response(:created)

      assert_schema(response, "AIUserConfigurationV1", api_spec)

      assert %{
               "provider" => expected_provider,
               "model" => model
             } == response
    end
  end

  describe "updating AI configuration" do
    test "should not allow updating AI configuration for a user that does not have one", %{
      conn: conn,
      api_spec: api_spec
    } do
      conn
      |> patch("/api/v1/profile/ai_configuration", %{
        model: build(:random_ai_model),
        api_key: Faker.String.base64()
      })
      |> json_response(:not_found)
      |> assert_schema("NotFoundV1", api_spec)
    end

    failing_update_validation_scenarios = [
      %{
        name: "empty payload",
        request_body_scenarios: [
          %{},
          nil,
          ""
        ],
        expected_errors: [
          %{
            "detail" => "Object property count 0 is less than minProperties: 1",
            "source" => %{"pointer" => "/"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "nil provider",
        request_body: %{
          provider: nil
        },
        expected_errors: [
          %{
            "detail" => "null value where string expected",
            "source" => %{"pointer" => "/provider"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "empty provider",
        request_body_scenarios:
          Enum.map(
            ["", "  "],
            &%{
              provider: &1
            }
          ),
        expected_errors: [
          %{
            "detail" => "can't be blank",
            "source" => %{"pointer" => "/provider"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "unsupported provider",
        request_body: %{
          provider: Faker.Lorem.word()
        },
        expected_errors: [
          %{
            "detail" => "is invalid",
            "source" => %{"pointer" => "/provider"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "non string provider",
        request_body_scenarios:
          Enum.map(
            [123, true, %{}, []],
            &%{
              provider: &1
            }
          ),
        expected_errors_scenarios:
          Enum.map(
            ["integer", "boolean", "object", "array"],
            &[
              %{
                "detail" => "Invalid string. Got: #{&1}",
                "source" => %{"pointer" => "/provider"},
                "title" => "Invalid value"
              }
            ]
          )
      },
      %{
        name: "nil model",
        request_body: %{
          model: nil,
          api_key: Faker.String.base64()
        },
        expected_errors: [
          %{
            "detail" => "null value where string expected",
            "source" => %{"pointer" => "/model"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "empty model",
        request_body_scenarios:
          Enum.map(
            ["", "  "],
            &%{
              model: &1,
              api_key: Faker.String.base64()
            }
          ),
        expected_errors: [
          %{
            "detail" => "can't be blank",
            "source" => %{"pointer" => "/model"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "non string model",
        request_body_scenarios:
          Enum.map(
            [123, true, %{}, []],
            &%{
              model: &1,
              api_key: Faker.String.base64()
            }
          ),
        expected_errors_scenarios:
          Enum.map(
            ["integer", "boolean", "object", "array"],
            &[
              %{
                "detail" => "Invalid string. Got: #{&1}",
                "source" => %{"pointer" => "/model"},
                "title" => "Invalid value"
              }
            ]
          )
      },
      %{
        name: "unsupported model",
        request_body: %{
          model: Faker.Lorem.word(),
          api_key: Faker.String.base64()
        },
        expected_errors: [
          %{
            "detail" => "is not supported",
            "source" => %{"pointer" => "/model"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "model unsupported by the specified provider",
        request_body: %{
          provider: :googleai,
          model: "gpt-5.4",
          api_key: Faker.String.base64()
        },
        expected_errors: [
          %{
            "detail" => "is not supported by the specified provider",
            "source" => %{"pointer" => "/model"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "nil api_key",
        request_body: %{
          model: build(:random_ai_model),
          api_key: nil
        },
        expected_errors: [
          %{
            "detail" => "null value where string expected",
            "source" => %{"pointer" => "/api_key"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "empty api_key",
        request_body_scenarios:
          Enum.map(
            ["", "  "],
            fn empty_api_key ->
              provider = build(:random_ai_provider)
              model = build(:random_ai_model, provider: provider)

              %{
                provider: provider,
                model: model,
                api_key: empty_api_key
              }
            end
          ),
        expected_errors: [
          %{
            "detail" => "can't be blank",
            "source" => %{"pointer" => "/api_key"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "non string api_key",
        request_body_scenarios:
          Enum.map(
            [123, true, %{}, []],
            &%{
              model: build(:random_ai_model),
              api_key: &1
            }
          ),
        expected_errors_scenarios:
          Enum.map(
            ["integer", "boolean", "object", "array"],
            &[
              %{
                "detail" => "Invalid string. Got: #{&1}",
                "source" => %{"pointer" => "/api_key"},
                "title" => "Invalid value"
              }
            ]
          )
      }
    ]

    for %{name: name} = failing_update_validation_scenario <- failing_update_validation_scenarios do
      @failing_update_validation_scenario failing_update_validation_scenario

      test "should fail to update an AI configuration with invalid data - #{name}", %{
        conn: conn,
        api_spec: api_spec,
        admin_user: %{id: user_id}
      } do
        %UserConfiguration{} = insert(:ai_user_configuration, user_id: user_id)

        expected_errors = Map.get(@failing_update_validation_scenario, :expected_errors, [])

        expected_errors_scenarios =
          Map.get(@failing_update_validation_scenario, :expected_errors_scenarios, [
            expected_errors
          ])

        request_body = Map.get(@failing_update_validation_scenario, :request_body, %{})

        request_body_scenarios =
          Map.get(@failing_update_validation_scenario, :request_body_scenarios, [request_body])

        for {resolved_scenario, index} <- Enum.with_index(request_body_scenarios) do
          resolved_expected_errors = Enum.at(expected_errors_scenarios, index, expected_errors)

          response =
            conn
            |> patch("/api/v1/profile/ai_configuration", resolved_scenario)
            |> json_response(:unprocessable_entity)

          assert_schema(response, "UnprocessableEntityV1", api_spec)

          assert %{
                   "errors" => resolved_expected_errors
                 } == response
        end
      end
    end

    test "should allow partial updates to the AI configuration - model only", %{
      conn: conn,
      api_spec: api_spec,
      admin_user: %{id: user_id}
    } do
      %UserConfiguration{
        provider: initial_provider,
        model: _initial_model
      } = insert(:ai_user_configuration, user_id: user_id)

      new_model = build(:random_ai_model, provider: initial_provider)

      expected_provider = Atom.to_string(initial_provider)

      response =
        conn
        |> patch("/api/v1/profile/ai_configuration", %{
          model: new_model
        })
        |> json_response(:ok)

      assert_schema(response, "AIUserConfigurationV1", api_spec)

      assert %{
               "provider" => expected_provider,
               "model" => new_model
             } == response
    end

    test "should allow partial updates to the AI configuration - api key only", %{
      conn: conn,
      api_spec: api_spec,
      admin_user: %{id: user_id}
    } do
      %UserConfiguration{
        model: initial_model,
        provider: initial_provider
      } = insert(:ai_user_configuration, user_id: user_id)

      response =
        conn
        |> patch("/api/v1/profile/ai_configuration", %{
          api_key: Faker.String.base64(32)
        })
        |> json_response(:ok)

      assert_schema(response, "AIUserConfigurationV1", api_spec)

      assert %{
               "provider" => Atom.to_string(initial_provider),
               "model" => initial_model
             } == response
    end

    test "should allow complete updates to the AI configuration", %{
      conn: conn,
      api_spec: api_spec,
      admin_user: %{id: user_id}
    } do
      %UserConfiguration{
        model: _initial_model,
        provider: _initial_provider
      } = insert(:ai_user_configuration, user_id: user_id)

      new_provider = build(:random_ai_provider)
      new_model = build(:random_ai_model, provider: new_provider)
      new_api_key = Faker.String.base64(32)

      expected_provider = Atom.to_string(new_provider)

      response =
        conn
        |> patch("/api/v1/profile/ai_configuration", %{
          provider: new_provider,
          model: new_model,
          api_key: new_api_key
        })
        |> json_response(:ok)

      assert_schema(response, "AIUserConfigurationV1", api_spec)

      assert %{
               "provider" => expected_provider,
               "model" => new_model
             } == response
    end
  end
end
