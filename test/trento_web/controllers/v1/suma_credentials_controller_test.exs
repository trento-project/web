defmodule TrentoWeb.V1.SUMACredentialsControllerTest do
  use TrentoWeb.ConnCase, async: true
  use Trento.SoftwareUpdates.DiscoveryCase

  import OpenApiSpex.TestAssertions

  import Mox
  import Trento.Factory
  import Trento.Support.Helpers.AbilitiesTestHelper

  alias TrentoWeb.OpenApi.V1.ApiSpec

  setup :setup_api_spec_v1
  setup :setup_user

  describe "retrieve user settings" do
    test "should return user settings", %{conn: conn} do
      insert_software_updates_settings(
        ca_cert: build(:self_signed_certificate),
        ca_uploaded_at: DateTime.utc_now()
      )

      api_spec = ApiSpec.spec()

      conn
      |> get("/api/v1/settings/suma_credentials")
      |> json_response(:ok)
      |> assert_schema("SUMACredentials", api_spec)
    end

    test "should return forbidden if no user settings have been saved", %{conn: conn} do
      api_spec = ApiSpec.spec()

      conn
      |> get("/api/v1/settings/suma_credentials")
      |> json_response(:not_found)
      |> assert_schema("NotFound", api_spec)
    end
  end

  describe "create new user settings" do
    test "should save new valid settings if no previous settings have been saved", %{conn: conn} do
      settings =
        %{url: url, username: username} = %{
          url: Faker.Internet.image_url(),
          username: Faker.Internet.user_name(),
          password: Faker.Lorem.word(),
          ca_cert: build(:self_signed_certificate)
        }

      %{"ca_uploaded_at" => ca_uploaded_at} =
        resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/settings/suma_credentials", settings)
        |> json_response(:created)

      assert %{"url" => ^url, "username" => ^username} = resp
      refute ca_uploaded_at == nil
    end

    test "should not save settings if HTTP protocol provided in URL", %{conn: conn} do
      settings = %{
        url: "http://insecureurl.com",
        username: Faker.Internet.user_name(),
        password: Faker.Lorem.word(),
        ca_cert: build(:self_signed_certificate)
      }

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/settings/suma_credentials", settings)
        |> json_response(:unprocessable_entity)

      assert %{
               "errors" => [
                 %{
                   "detail" => "can only be an https url",
                   "source" => %{"pointer" => "/url"},
                   "title" => "Invalid value"
                 }
               ]
             } == resp
    end

    test "should return 422 status if no body is provided in request", %{conn: conn} do
      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/settings/suma_credentials", nil)
        |> json_response(:unprocessable_entity)

      assert %{
               "errors" => [
                 %{
                   "detail" => "Missing field: url",
                   "source" => %{"pointer" => "/url"},
                   "title" => "Invalid value"
                 },
                 %{
                   "detail" => "Missing field: username",
                   "source" => %{"pointer" => "/username"},
                   "title" => "Invalid value"
                 },
                 %{
                   "detail" => "Missing field: password",
                   "source" => %{"pointer" => "/password"},
                   "title" => "Invalid value"
                 }
               ]
             } == resp
    end

    test "should not save valid settings when previously settings have been saved", %{conn: conn} do
      insert_software_updates_settings(ca_cert: nil, ca_uploaded_at: nil)

      new_settings = %{
        url: Faker.Internet.image_url(),
        username: Faker.Internet.user_name(),
        password: Faker.Lorem.word(),
        ca_cert: build(:self_signed_certificate)
      }

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/settings/suma_credentials", new_settings)
        |> json_response(:unprocessable_entity)

      assert %{
               "errors" => [
                 %{
                   "detail" => "Credentials have already been set.",
                   "title" => "Unprocessable Entity"
                 }
               ]
             } == resp
    end

    test "should not save invalid settings", %{conn: conn} do
      settings = %{
        url: Faker.Internet.image_url(),
        username: Faker.Internet.user_name()
      }

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/settings/suma_credentials", settings)
        |> json_response(:unprocessable_entity)

      assert %{
               "errors" => [
                 %{
                   "detail" => "Missing field: password",
                   "source" => %{"pointer" => "/password"},
                   "title" => "Invalid value"
                 }
               ]
             } == resp
    end
  end

  describe "changing software updates settings" do
    test "should not be able to change software updates settings if none previously saved", %{
      conn: conn
    } do
      submission = %{
        url: "https://validurl.com",
        username: Faker.Internet.user_name(),
        password: Faker.Lorem.word(),
        ca_cert: nil
      }

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> patch("/api/v1/settings/suma_credentials", submission)
        |> json_response(:not_found)

      assert %{
               "errors" => [
                 %{"detail" => "The requested resource cannot be found.", "title" => "Not Found"}
               ]
             } == resp
    end

    test "should not process empty request body", %{
      conn: conn
    } do
      insert_software_updates_settings()

      submission = %{}

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> patch("/api/v1/settings/suma_credentials", submission)
        |> json_response(:unprocessable_entity)

      assert %{
               "errors" => [
                 %{
                   "detail" => "Object property count 0 is less than minProperties: 1",
                   "title" => "Invalid value",
                   "source" => %{"pointer" => "/"}
                 }
               ]
             } == resp
    end

    test "should validate partial changes to software updates settings", %{conn: conn} do
      insert_software_updates_settings()

      change_settings_scenarios = [
        %{
          change_submissions: %{url: nil},
          errors: [
            %{
              "detail" => "null value where string expected",
              "source" => %{"pointer" => "/url"},
              "title" => "Invalid value"
            }
          ]
        },
        %{
          change_submissions: [%{url: ""}, %{url: "   "}],
          errors: [
            %{
              "detail" => "can't be blank",
              "source" => %{"pointer" => "/url"},
              "title" => "Invalid value"
            }
          ]
        },
        %{
          change_submissions: %{url: "http://not-secure.com"},
          errors: [
            %{
              "detail" => "can only be an https url",
              "source" => %{"pointer" => "/url"},
              "title" => "Invalid value"
            }
          ]
        },
        %{
          change_submissions: %{username: nil},
          errors: [
            %{
              "detail" => "null value where string expected",
              "source" => %{"pointer" => "/username"},
              "title" => "Invalid value"
            }
          ]
        },
        %{
          change_submissions: [%{username: ""}, %{username: "   "}],
          errors: [
            %{
              "detail" => "can't be blank",
              "source" => %{"pointer" => "/username"},
              "title" => "Invalid value"
            }
          ]
        },
        %{
          change_submissions: %{password: nil},
          errors: [
            %{
              "detail" => "null value where string expected",
              "source" => %{"pointer" => "/password"},
              "title" => "Invalid value"
            }
          ]
        },
        %{
          change_submissions: [
            %{password: ""},
            %{password: "   "}
          ],
          errors: [
            %{
              "detail" => "can't be blank",
              "source" => %{"pointer" => "/password"},
              "title" => "Invalid value"
            }
          ]
        },
        %{
          change_submissions: [
            %{ca_cert: ""},
            %{ca_cert: "   "}
          ],
          errors: [
            %{
              "detail" => "can't be blank",
              "source" => %{"pointer" => "/ca_cert"},
              "title" => "Invalid value"
            }
          ]
        },
        %{
          change_submissions: %{
            url: nil,
            username: "",
            password: "   ",
            ca_cert: nil
          },
          errors: [
            %{
              "detail" => "null value where string expected",
              "source" => %{"pointer" => "/url"},
              "title" => "Invalid value"
            }
          ]
        }
      ]

      for %{change_submissions: change_submissions, errors: errors} <- change_settings_scenarios do
        change_submissions
        |> List.wrap()
        |> Enum.each(fn change_submission ->
          resp =
            conn
            |> put_req_header("content-type", "application/json")
            |> patch("/api/v1/settings/suma_credentials", change_submission)
            |> json_response(:unprocessable_entity)

          assert %{"errors" => errors} == resp
        end)
      end
    end

    test "should support partial change of software updates settings", %{conn: conn} do
      %{
        url: initial_url,
        username: _initial_username,
        password: _initial_password,
        ca_cert: _initial_ca_cert,
        ca_uploaded_at: initial_ca_uploaded_at
      } =
        insert_software_updates_settings(
          ca_cert: build(:self_signed_certificate),
          ca_uploaded_at: DateTime.utc_now()
        )

      change_submission = %{
        username: new_username = "new_username",
        password: "new_password"
      }

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> patch("/api/v1/settings/suma_credentials", change_submission)
        |> json_response(:ok)

      assert %{
               "url" => initial_url,
               "username" => new_username,
               "ca_uploaded_at" => DateTime.to_iso8601(initial_ca_uploaded_at)
             } == resp
    end

    test "should properly update ca_cert and its upload date when a new cert is provided", %{
      conn: conn
    } do
      %{
        url: _initial_url,
        username: initial_username,
        password: _initial_password,
        ca_cert: _initial_ca_cert,
        ca_uploaded_at: initial_ca_uploaded_at
      } =
        insert_software_updates_settings(
          ca_cert: build(:self_signed_certificate),
          ca_uploaded_at: DateTime.utc_now()
        )

      change_submission = %{
        url: new_url = "https://new.com",
        ca_cert: build(:self_signed_certificate)
      }

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> patch("/api/v1/settings/suma_credentials", change_submission)
        |> json_response(:ok)

      assert %{"url" => ^new_url, "username" => ^initial_username} = resp

      %{"ca_uploaded_at" => new_upload_time} = resp

      refute new_upload_time == initial_ca_uploaded_at
    end

    test "should properly remove ca_cert and its upload date", %{conn: conn} do
      %{
        url: initial_url,
        username: initial_username,
        password: _initial_password,
        ca_cert: _initial_ca_cert,
        ca_uploaded_at: _initial_ca_uploaded_at
      } =
        insert_software_updates_settings(
          ca_cert: build(:self_signed_certificate),
          ca_uploaded_at: DateTime.utc_now()
        )

      change_submission = %{
        ca_cert: nil
      }

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> patch("/api/v1/settings/suma_credentials", change_submission)
        |> json_response(:ok)

      assert %{
               "url" => initial_url,
               "username" => initial_username,
               "ca_uploaded_at" => nil
             } == resp
    end
  end

  describe "Clear user settings" do
    test "should return 204 if no user settings have previously been saved", %{conn: conn} do
      conn = delete(conn, "/api/v1/settings/suma_credentials")

      assert response(conn, 204) == ""
    end

    test "should return 204 when user settings have previously been saved", %{conn: conn} do
      insert_software_updates_settings()

      conn = delete(conn, "/api/v1/settings/suma_credentials")

      assert response(conn, 204) == ""
    end
  end

  describe "testing connection with SUMA" do
    test "should return 422 on test connection failure", %{conn: conn} do
      error_reasons = [
        :settings_not_configured,
        :some_error_during_test_connection
      ]

      for error_reason <- error_reasons do
        expect(Trento.SoftwareUpdates.Discovery.Mock, :setup, fn -> {:error, error_reason} end)

        resp =
          conn
          |> put_req_header("content-type", "application/json")
          |> post("/api/v1/settings/suma_credentials/test", %{})
          |> json_response(:unprocessable_entity)

        assert %{
                 "errors" => [
                   %{
                     "detail" => "Connection with software updates provider failed.",
                     "title" => "Unprocessable Entity"
                   }
                 ]
               } == resp
      end
    end

    test "should return 200 on successful test connection", %{conn: conn} do
      expect(Trento.SoftwareUpdates.Discovery.Mock, :setup, fn -> :ok end)

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/settings/suma_credentials/test")
        |> json_response(:ok)

      assert "" == resp
    end
  end

  describe "forbidden response" do
    test "should return forbidden when user tries to create settings without right abilities", %{
      conn: conn,
      api_spec: api_spec
    } do
      settings = %{
        url: Faker.Internet.image_url(),
        username: Faker.Internet.user_name(),
        password: Faker.Lorem.word(),
        ca_cert: build(:self_signed_certificate)
      }

      %{id: user_id} = insert(:user)

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

      conn
      |> post("/api/v1/settings/suma_credentials", settings)
      |> json_response(:forbidden)
      |> assert_schema("Forbidden", api_spec)
    end

    test "should return forbidden when user tries to update settings without right abilities", %{
      conn: conn,
      api_spec: api_spec
    } do
      insert_software_updates_settings()
      %{id: user_id} = insert(:user)

      change_submission = %{}

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

      conn
      |> patch("/api/v1/settings/suma_credentials", change_submission)
      |> json_response(:forbidden)
      |> assert_schema("Forbidden", api_spec)
    end
  end

  test "should return forbidden when user tries to delete settings without right abilities", %{
    conn: conn,
    api_spec: api_spec
  } do
    %{id: user_id} = insert(:user)

    conn =
      conn
      |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
      |> put_req_header("content-type", "application/json")

    conn
    |> delete("/api/v1/settings/suma_credentials")
    |> json_response(:forbidden)
    |> assert_schema("Forbidden", api_spec)
  end
end
