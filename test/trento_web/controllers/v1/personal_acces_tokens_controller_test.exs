defmodule TrentoWeb.V1.PersonalAccessTokensControllerTest do
  alias Trento.Users.PersonalAccessToken
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory
  import OpenApiSpex.TestAssertions
  import Trento.Support.Helpers.AbilitiesTestHelper

  setup :setup_api_spec_v1
  setup :setup_user

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "content-type", "application/json")}
  end

  describe "creating personal access tokens" do
    failing_validation_scenarios = [
      %{
        name: "empty attributes",
        request_body: %{},
        expected_errors: [
          %{
            "detail" => "Missing field: name",
            "source" => %{"pointer" => "/name"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "nil name",
        request_body: %{name: nil},
        expected_errors: [
          %{
            "detail" => "null value where string expected",
            "source" => %{"pointer" => "/name"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "empty string name",
        request_body: %{name: ""},
        expected_errors: [
          %{
            "detail" => "can't be blank",
            "source" => %{"pointer" => "/name"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "blank name",
        request_body: %{name: " "},
        expected_errors: [
          %{
            "detail" => "can't be blank",
            "source" => %{"pointer" => "/name"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "invalid name - number",
        request_body: %{name: 42},
        expected_errors: [
          %{
            "detail" => "Invalid string. Got: integer",
            "source" => %{"pointer" => "/name"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "invalid name - boolean",
        request_body: %{name: true},
        expected_errors: [
          %{
            "detail" => "Invalid string. Got: boolean",
            "source" => %{"pointer" => "/name"},
            "title" => "Invalid value"
          }
        ]
      },
      %{
        name: "invalid expiration date: invalid format",
        request_body: %{name: Faker.Lorem.word(), expire_at: "123"},
        expected_errors: [
          %{
            "detail" => "Invalid format. Expected :\"date-time\"",
            "source" => %{"pointer" => "/expire_at"},
            "title" => "Invalid value"
          }
        ]
      }
    ]

    for %{name: name} = failing_validation_scenario <- failing_validation_scenarios do
      @failing_validation_scenario failing_validation_scenario

      test "should fail to create a new PAT with invalid data - #{name}", %{
        conn: conn,
        api_spec: api_spec
      } do
        %{
          request_body: request_body,
          expected_errors: expected_errors
        } = @failing_validation_scenario

        resp =
          conn
          |> post("/api/v1/profile/tokens", request_body)
          |> json_response(:unprocessable_entity)

        assert_schema(resp, "UnprocessableEntity", api_spec)

        assert %{
                 "errors" => expected_errors
               } == resp
      end
    end

    test "should fail when creating a personal access token when the name was already taken", %{
      conn: conn,
      api_spec: api_spec,
      admin_user: %{id: user_id}
    } do
      %PersonalAccessToken{name: taken_name} = insert(:personal_access_token, user_id: user_id)

      resp =
        conn
        |> post("/api/v1/profile/tokens", %{
          "name" => taken_name
        })
        |> json_response(:unprocessable_entity)

      assert_schema(resp, "UnprocessableEntity", api_spec)

      assert %{
               "errors" => [
                 %{
                   "detail" => "has already been taken",
                   "source" => %{"pointer" => "/name"},
                   "title" => "Invalid value"
                 }
               ]
             } == resp
    end

    scenarios = [
      %{
        name: "without expiration - missing field",
        request_body: %{name: Faker.Lorem.word()}
      },
      %{
        name: "without expiration - nil field",
        request_body: %{name: Faker.Lorem.word(), expire_at: nil}
      },
      %{
        name: "with expiration date",
        request_body: %{
          name: Faker.Lorem.word(),
          expire_at:
            2
            |> Faker.DateTime.forward()
            |> DateTime.to_iso8601()
        }
      }
    ]

    for %{name: name} = scenario <- scenarios do
      @scenario scenario
      test "should successfully create a personal access token - #{name}", %{
        conn: conn,
        api_spec: api_spec
      } do
        %{request_body: %{name: pat_name} = request_body} = @scenario
        expire_at = Map.get(request_body, :expire_at, nil)

        resp =
          conn
          |> post("/api/v1/profile/tokens", request_body)
          |> json_response(:created)

        assert_schema(resp, "CreatedPersonalAccessToken", api_spec)

        assert %{
                 "jti" => _,
                 "name" => ^pat_name,
                 "expire_at" => ^expire_at,
                 "created_at" => _,
                 "access_token" => _
               } = resp

        access_token = resp["access_token"]

        assert is_bitstring(access_token)
        assert String.length(access_token) > 0
      end
    end
  end
end
