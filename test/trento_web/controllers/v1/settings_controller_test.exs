defmodule TrentoWeb.V1.SettingsControllerTest do
  use TrentoWeb.ConnCase, async: true
  use Trento.SoftwareUpdates.DiscoveryCase

  import Trento.Factory
  import OpenApiSpex.TestAssertions
  import Trento.Support.Helpers.AbilitiesTestHelper
  import Mox

  alias TrentoWeb.OpenApi.V1.ApiSpec

  setup :setup_api_spec_v1
  setup :setup_user

  test "should return the settings according to the schema", %{conn: conn} do
    api_spec = ApiSpec.spec()

    conn = get(conn, "/api/v1/settings")

    conn
    |> json_response(200)
    |> assert_schema("PlatformSettings", api_spec)
  end

  describe "ApiKeySettings" do
    setup do
      %{api_spec: ApiSpec.spec()}
    end

    test "should return not found when api key settings are not configured", %{
      conn: conn,
      api_spec: api_spec
    } do
      conn
      |> get("/api/v1/settings/api_key")
      |> json_response(404)
      |> assert_schema("NotFound", api_spec)
    end

    test "should return the api key settings are configured", %{
      conn: conn,
      api_spec: api_spec
    } do
      insert(:api_key_settings)

      conn
      |> get("/api/v1/settings/api_key")
      |> json_response(200)
      |> assert_schema("ApiKeySettings", api_spec)
    end

    test "should not update the api key settings if it is not configured returning not found",
         %{conn: conn, api_spec: api_spec} do
      conn
      |> put_req_header("content-type", "application/json")
      |> patch("/api/v1/settings/api_key", %{
        expire_at: DateTime.to_iso8601(DateTime.utc_now())
      })
      |> json_response(404)
      |> assert_schema("NotFound", api_spec)
    end

    test "should update the api key settings if it is configured returning the updated settings",
         %{conn: conn, api_spec: api_spec} do
      insert(:api_key_settings)

      conn
      |> put_req_header("content-type", "application/json")
      |> patch("/api/v1/settings/api_key", %{
        expire_at: DateTime.to_iso8601(DateTime.utc_now())
      })
      |> json_response(200)
      |> assert_schema("ApiKeySettings", api_spec)
    end

    test "should consistently return the same generated key across different requests with the same settings",
         %{conn: conn} do
      insert(:api_key_settings)

      %{"generated_api_key" => first_generated_api_key} =
        conn
        |> get("/api/v1/settings/api_key")
        |> json_response(200)

      %{"generated_api_key" => second_generated_api_key} =
        conn
        |> get("/api/v1/settings/api_key")
        |> json_response(200)

      assert first_generated_api_key == second_generated_api_key
    end

    test "should generate an infinite api key if the expiration in the settings is set to nil in an update",
         %{conn: conn} do
      insert(:api_key_settings)

      %{"generated_api_key" => infinite_api_key} =
        conn
        |> put_req_header("content-type", "application/json")
        |> patch("/api/v1/settings/api_key", %{
          expire_at: nil
        })
        |> json_response(200)

      {:ok, %{"exp" => expiration}} = Joken.peek_claims(infinite_api_key)

      {expire_year, _} =
        DateTime.from_unix!(expiration) |> DateTime.to_date() |> Date.year_of_era()

      {expected_infinite_year, _} =
        DateTime.utc_now()
        |> DateTime.add(100 * 365, :day)
        |> DateTime.to_date()
        |> Date.year_of_era()

      assert expire_year == expected_infinite_year
    end
  end

  describe "ActivityLogSettings" do
    setup do
      %{api_spec: ApiSpec.spec()}
    end

    test "should return activity retention settings after setting up", %{
      conn: conn,
      api_spec: api_spec
    } do
      insert(:activity_log_settings)

      conn
      |> get("/api/v1/settings/activity_log")
      |> json_response(200)
      |> assert_schema("ActivityLogSettings", api_spec)
    end

    test "should not return activity retention settings without setting up", %{
      conn: conn,
      api_spec: api_spec
    } do
      conn
      |> get("/api/v1/settings/activity_log")
      |> json_response(404)
      |> assert_schema("NotFound", api_spec)
    end

    test "should update the activity log settings if it is configured returning the updated settings",
         %{conn: conn, api_spec: api_spec} do
      insert(:activity_log_settings)

      conn
      |> put_req_header("content-type", "application/json")
      |> put("/api/v1/settings/activity_log", %{
        retention_time: %{
          value: 42,
          unit: :year
        }
      })
      |> json_response(200)
      |> assert_schema("ActivityLogSettings", api_spec)
    end

    test "should not update the activity log settings if it is not already configured",
         %{conn: conn, api_spec: api_spec} do
      conn
      |> put_req_header("content-type", "application/json")
      |> put("/api/v1/settings/activity_log", %{
        retention_time: %{
          value: 42,
          unit: :year
        }
      })
      |> json_response(422)
      |> assert_schema("UnprocessableEntity", api_spec)
    end
  end

  describe "SuseManagerSettings" do
    test "should return user settings", %{conn: conn} do
      insert_software_updates_settings(
        ca_cert: build(:self_signed_certificate),
        ca_uploaded_at: DateTime.utc_now()
      )

      api_spec = ApiSpec.spec()

      conn
      |> get("/api/v1/settings/suse_manager")
      |> json_response(:ok)
      |> assert_schema("SuseManagerSettings", api_spec)
    end

    test "should return forbidden if no user settings have been saved", %{conn: conn} do
      api_spec = ApiSpec.spec()

      conn
      |> get("/api/v1/settings/suse_manager")
      |> json_response(:not_found)
      |> assert_schema("NotFound", api_spec)
    end

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
        |> post("/api/v1/settings/suse_manager", settings)
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
        |> post("/api/v1/settings/suse_manager", settings)
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
        |> post("/api/v1/settings/suse_manager", nil)
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
        |> post("/api/v1/settings/suse_manager", new_settings)
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
        |> post("/api/v1/settings/suse_manager", settings)
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

    test "should not be able to change suse manager settings if none previously saved", %{
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
        |> patch("/api/v1/settings/suse_manager", submission)
        |> json_response(:not_found)

      assert %{
               "errors" => [
                 %{"detail" => "SUSE Manager settings not configured.", "title" => "Not Found"}
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
        |> patch("/api/v1/settings/suse_manager", submission)
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

    test "should validate partial changes to suse manager settings", %{conn: conn} do
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
            |> patch("/api/v1/settings/suse_manager", change_submission)
            |> json_response(:unprocessable_entity)

          assert %{"errors" => errors} == resp
        end)
      end
    end

    test "should support partial change of suse manager settings", %{conn: conn} do
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
        |> patch("/api/v1/settings/suse_manager", change_submission)
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
        |> patch("/api/v1/settings/suse_manager", change_submission)
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
        |> patch("/api/v1/settings/suse_manager", change_submission)
        |> json_response(:ok)

      assert %{
               "url" => initial_url,
               "username" => initial_username,
               "ca_uploaded_at" => nil
             } == resp
    end

    test "should return 204 if no user settings have previously been saved", %{conn: conn} do
      conn = delete(conn, "/api/v1/settings/suse_manager")

      assert response(conn, 204) == ""
    end

    test "should return 204 when user settings have previously been saved", %{conn: conn} do
      insert_software_updates_settings()

      conn = delete(conn, "/api/v1/settings/suse_manager")

      assert response(conn, 204) == ""
    end

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
          |> post("/api/v1/settings/suse_manager/test", %{})
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
        |> post("/api/v1/settings/suse_manager/test")
        |> json_response(:ok)

      assert "" == resp
    end
  end

  describe "SSOCertificatesSettings" do
    setup do
      %{api_spec: ApiSpec.spec()}
    end

    test "should return uploaded certificates public content in the public_keys route", %{
      conn: conn,
      api_spec: api_spec
    } do
      %{name: name, certificate_file: cert} = insert(:sso_certificates_settings)

      resp =
        conn
        |> get("/api/public_keys")
        |> json_response(200)
        |> assert_schema("PublicKeys", api_spec)

      assert [%{name: name, content: cert}] == resp
    end
  end

  describe "forbidden response" do
    test "should return forbidden if the user does not have the permission to update the api key",
         %{conn: conn, api_spec: api_spec} do
      insert(:api_key_settings)
      %{id: user_id} = insert(:user)

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

      conn =
        patch(conn, "/api/v1/settings/api_key", %{
          "expire_at" => DateTime.to_iso8601(DateTime.utc_now())
        })

      conn
      |> json_response(:forbidden)
      |> assert_schema("Forbidden", api_spec)
    end

    test "should return forbidden if the user does not have the permission to edit activity logs settings",
         %{conn: conn, api_spec: api_spec} do
      %{id: user_id} = insert(:user)
      insert(:activity_log_settings)

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

      conn =
        put(conn, "/api/v1/settings/activity_log", %{
          retention_time: %{
            value: 42,
            unit: :year
          }
        })

      conn
      |> json_response(:forbidden)
      |> assert_schema("Forbidden", api_spec)
    end

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
      |> post("/api/v1/settings/suse_manager", settings)
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
      |> patch("/api/v1/settings/suse_manager", change_submission)
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
    |> delete("/api/v1/settings/suse_manager")
    |> json_response(:forbidden)
    |> assert_schema("Forbidden", api_spec)
  end
end
