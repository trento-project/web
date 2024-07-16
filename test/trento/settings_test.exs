defmodule Trento.SettingsTest do
  use ExUnit.Case
  use Trento.DataCase
  use Trento.CommandedCase
  use Trento.TaskCase
  use Trento.SoftwareUpdates.DiscoveryCase

  import Mox

  import Trento.Factory

  alias Trento.Settings

  alias Trento.Settings.{
    ApiKeySettings,
    InstallationSettings,
    SuseManagerSettings
  }

  alias Trento.Hosts.Commands.CompleteSoftwareUpdatesDiscovery

  setup do
    Application.put_env(:trento, :flavor, "Premium")
    insert(:sles_subscription, identifier: "SLES_SAP")

    on_exit(fn -> Application.put_env(:trento, :flavor, "Community") end)
  end

  describe "installation_settings" do
    test "should return premium active if flavor is premium and at least one SLES_SAP subscription exist" do
      assert Settings.premium_active?()
    end

    test "should give the flavor for the current installation" do
      Application.put_env(:trento, :flavor, "Premium")
      assert Settings.flavor() === "Premium"

      Application.put_env(:trento, :flavor, "Community")
      assert Settings.flavor() === "Community"
    end

    test "should not create a new InstallationSettings if is already present" do
      {:error, errors} =
        %InstallationSettings{}
        |> InstallationSettings.changeset(%{installation_id: UUID.uuid4()})
        |> Repo.insert()

      assert errors_on(errors) == %{type: ["has already been taken"]}
    end
  end

  describe "api_key_settings" do
    test "should create api key settings with the correct fields" do
      jti = UUID.uuid4()
      creation_date = DateTime.utc_now()
      expiration_date = DateTime.add(creation_date, 10, :hour)

      assert {:ok,
              %ApiKeySettings{
                jti: ^jti,
                created_at: ^creation_date,
                expire_at: ^expiration_date
              }} =
               Settings.create_api_key_settings(%{
                 jti: jti,
                 created_at: creation_date,
                 expire_at: expiration_date
               })
    end

    test "should not create another ApiKeySettings if one is already present" do
      insert(:api_key_settings)

      assert {:error, errors} =
               Settings.create_api_key_settings(%{
                 jti: UUID.uuid4(),
                 expire_at: DateTime.utc_now(),
                 created_at: DateTime.utc_now()
               })

      assert errors_on(errors) == %{type: ["has already been taken"]}
    end

    test "should not create ApiKeySettings if jti and created_at fields are missing" do
      assert {:error, errors} = Settings.create_api_key_settings(%{})

      assert errors_on(errors) == %{
               jti: ["can't be blank"],
               created_at: ["can't be blank"]
             }
    end

    test "should return ApiKeySettings when present" do
      insert(:api_key_settings)

      assert {:ok, %ApiKeySettings{}} = Settings.get_api_key_settings()
    end

    test "should not return ApiKeySettings when not present" do
      assert {:error, :api_key_settings_missing} == Settings.get_api_key_settings()
    end

    test "should not update ApiKeySettings when some fields are not present" do
      assert {:error, :api_key_settings_missing} ==
               Settings.update_api_key_settings(DateTime.utc_now())
    end

    test "should update ApiKeySettings when some fields are present, with a new expiration and generated creation and jti" do
      %ApiKeySettings{
        jti: old_jti,
        created_at: old_created_at,
        expire_at: old_expire_at
      } = insert(:api_key_settings)

      new_expiration = DateTime.utc_now()

      {:ok,
       %ApiKeySettings{
         jti: new_jti,
         created_at: new_created_at,
         expire_at: new_expire_at
       }} = Settings.update_api_key_settings(new_expiration)

      refute new_jti == old_jti
      refute new_expire_at == old_expire_at
      refute new_created_at == old_created_at
      assert new_expire_at == new_expiration
    end
  end

  describe "suse_manager_settings" do
    test "should return an error when settings are not available" do
      assert {:error, :settings_not_configured} == Settings.get_suse_manager_settings()
    end

    test "should return settings without ca certificate" do
      %{
        url: url,
        username: username,
        password: password
      } =
        insert_software_updates_settings(
          ca_cert: nil,
          ca_uploaded_at: nil
        )

      assert {:ok,
              %SuseManagerSettings{
                url: ^url,
                username: ^username,
                password: ^password,
                ca_cert: nil,
                ca_uploaded_at: nil
              }} = Settings.get_suse_manager_settings()
    end

    test "should return settings with ca certificate" do
      %{
        url: url,
        username: username,
        password: password,
        ca_cert: ca_cert,
        ca_uploaded_at: ca_uploaded_at
      } =
        insert_software_updates_settings(
          ca_cert: build(:self_signed_certificate),
          ca_uploaded_at: DateTime.utc_now()
        )

      assert {:ok,
              %SuseManagerSettings{
                url: ^url,
                username: ^username,
                password: ^password,
                ca_cert: ^ca_cert,
                ca_uploaded_at: ^ca_uploaded_at
              }} = Settings.get_suse_manager_settings()
    end

    test "should not save invalid suse manager settings" do
      submission = %{
        url: "https://valid.com",
        username: Faker.Internet.user_name(),
        password: Faker.Lorem.word(),
        ca_cert: nil
      }

      saving_scenarios = [
        %{
          submission: [
            Map.put(submission, :url, nil),
            Map.delete(submission, :url),
            Map.put(submission, :url, ""),
            Map.put(submission, :url, "   ")
          ],
          errors: [url: {"can't be blank", [validation: :required]}]
        },
        %{
          submission: Map.put(submission, :url, "http://not-secure.com"),
          errors: [url: {"can only be an https url", [validation: :https_url_only]}]
        },
        %{
          submission: [
            Map.put(submission, :username, nil),
            Map.delete(submission, :username),
            Map.put(submission, :username, ""),
            Map.put(submission, :username, "   ")
          ],
          errors: [username: {"can't be blank", [validation: :required]}]
        },
        %{
          submission: [
            Map.put(submission, :password, nil),
            Map.delete(submission, :password),
            Map.put(submission, :password, ""),
            Map.put(submission, :password, "   ")
          ],
          errors: [password: {"can't be blank", [validation: :required]}]
        },
        %{
          submission: [
            Map.put(submission, :ca_cert, ""),
            Map.put(submission, :ca_cert, "   ")
          ],
          errors: [ca_cert: {"can't be blank", [validation: :required]}]
        }
      ]

      for %{submission: submission, errors: errors} <- saving_scenarios do
        submission
        |> List.wrap()
        |> Enum.each(fn submission ->
          assert {:error, %{errors: ^errors}} = Settings.save_suse_manager_settings(submission)
        end)
      end
    end

    test "should save suse manager settings without ca cert" do
      settings = %{
        url: url = "https://valid.com",
        username: username = Faker.Internet.user_name(),
        password: password = Faker.Lorem.word()
      }

      assert {:ok,
              %SuseManagerSettings{
                url: ^url,
                username: ^username,
                password: ^password,
                ca_cert: nil,
                ca_uploaded_at: nil
              }} = Settings.save_suse_manager_settings(settings)
    end

    test "should save suse manager settings with a nil ca cert" do
      settings = %{
        url: url = "https://valid.com",
        username: username = Faker.Internet.user_name(),
        password: password = Faker.Lorem.word(),
        ca_cert: nil
      }

      assert {:ok,
              %SuseManagerSettings{
                url: ^url,
                username: ^username,
                password: ^password,
                ca_cert: nil,
                ca_uploaded_at: nil
              }} = Settings.save_suse_manager_settings(settings)
    end

    test "should save suse manager settings with ca cert" do
      now = DateTime.utc_now()

      expect(
        Trento.Support.DateService.Mock,
        :utc_now,
        fn -> now end
      )

      settings = %{
        url: url = "https://valid.com",
        username: username = Faker.Internet.user_name(),
        password: password = Faker.Lorem.word(),
        ca_cert: ca_cert = build(:self_signed_certificate)
      }

      assert {:ok,
              %SuseManagerSettings{
                url: ^url,
                username: ^username,
                password: ^password,
                ca_cert: ^ca_cert,
                ca_uploaded_at: ^now
              }} = Settings.save_suse_manager_settings(settings, Trento.Support.DateService.Mock)
    end

    test "should not save suse manager settings if already saved" do
      settings = %{
        url: "https://valid.com",
        username: Faker.Internet.user_name(),
        password: Faker.Lorem.word(),
        ca_cert: nil
      }

      assert {:ok, _} = Settings.save_suse_manager_settings(settings)

      assert {:error, :settings_already_configured} =
               Settings.save_suse_manager_settings(settings)
    end

    test "should issue software updates discovery process when saving or updating settings" do
      insert_list(5, :host)
      insert(:host, deregistered_at: DateTime.to_iso8601(Faker.DateTime.backward(2)))

      operations = [
        &Settings.save_suse_manager_settings/1,
        &Settings.change_suse_manager_settings/1
      ]

      for operation <- operations do
        expect(Trento.SoftwareUpdates.Discovery.Mock, :clear, 1, fn -> :ok end)

        expect(
          Trento.Commanded.Mock,
          :dispatch,
          5,
          fn %CompleteSoftwareUpdatesDiscovery{} -> :ok end
        )

        settings = %{
          url: "https://valid.com",
          username: Faker.Internet.user_name(),
          password: Faker.Lorem.word(),
          ca_cert: build(:self_signed_certificate)
        }

        assert {:ok, _} = operation.(settings)

        wait_for_tasks_completion()
      end
    end

    test "should not be able to change suse manager settings if none previously saved" do
      submission = %{
        url: "https://valid.com",
        username: Faker.Internet.user_name(),
        password: Faker.Lorem.word(),
        ca_cert: nil
      }

      assert {:error, :settings_not_configured} ==
               Settings.change_suse_manager_settings(submission)
    end

    test "should validate partial changes to suse manager settings" do
      insert_software_updates_settings()

      change_settings_scenarios = [
        %{
          change_submissions: [
            %{url: nil},
            %{url: ""},
            %{url: "   "}
          ],
          errors: [url: {"can't be blank", [validation: :required]}]
        },
        %{
          change_submissions: %{url: "http://not-secure.com"},
          errors: [url: {"can only be an https url", [validation: :https_url_only]}]
        },
        %{
          change_submissions: [
            %{username: nil},
            %{username: ""},
            %{username: "   "}
          ],
          errors: [username: {"can't be blank", [validation: :required]}]
        },
        %{
          change_submissions: [
            %{password: nil},
            %{password: ""},
            %{password: "   "}
          ],
          errors: [password: {"can't be blank", [validation: :required]}]
        },
        %{
          change_submissions: %{
            url: nil,
            username: "",
            password: "   ",
            ca_cert: nil
          },
          errors: [
            {:url, {"can't be blank", [validation: :required]}},
            {:username, {"can't be blank", [validation: :required]}},
            {:password, {"can't be blank", [validation: :required]}}
          ]
        },
        %{
          change_submissions: [
            %{ca_cert: ""},
            %{ca_cert: "   "}
          ],
          errors: [ca_cert: {"can't be blank", [validation: :required]}]
        }
      ]

      for %{change_submissions: change_submissions, errors: errors} <- change_settings_scenarios do
        change_submissions
        |> List.wrap()
        |> Enum.each(fn change_submission ->
          assert {:error, %{errors: ^errors}} =
                   Settings.change_suse_manager_settings(change_submission)
        end)
      end
    end

    test "should support partial change of suse manager settings" do
      %{
        url: initial_url,
        username: _initial_username,
        password: _initial_password,
        ca_cert: initial_ca_cert,
        ca_uploaded_at: initial_ca_uploaded_at
      } =
        insert_software_updates_settings(
          ca_cert: Faker.Lorem.sentence(),
          ca_uploaded_at: DateTime.utc_now()
        )

      change_submission = %{
        username: new_username = "new_username",
        password: new_password = "new_password"
      }

      assert {:ok,
              %{
                url: ^initial_url,
                username: ^new_username,
                password: ^new_password,
                ca_cert: ^initial_ca_cert,
                ca_uploaded_at: ^initial_ca_uploaded_at
              }} = Settings.change_suse_manager_settings(change_submission)
    end

    test "should properly update ca_cert and its upload date when a new cert is provided" do
      now = DateTime.utc_now()

      expect(
        Trento.Support.DateService.Mock,
        :utc_now,
        fn -> now end
      )

      %{
        url: _initial_url,
        username: initial_username,
        password: initial_password,
        ca_cert: _initial_ca_cert,
        ca_uploaded_at: _initial_ca_uploaded_at
      } =
        insert_software_updates_settings(
          ca_cert: Faker.Lorem.sentence(),
          ca_uploaded_at: DateTime.utc_now()
        )

      change_submission = %{
        url: new_url = "https://new.com",
        ca_cert: new_ca_cert = build(:self_signed_certificate)
      }

      assert {:ok,
              %{
                url: ^new_url,
                username: ^initial_username,
                password: ^initial_password,
                ca_cert: ^new_ca_cert,
                ca_uploaded_at: ^now
              }} =
               Settings.change_suse_manager_settings(
                 change_submission,
                 Trento.Support.DateService.Mock
               )
    end

    test "should support idempotent sequential settings updates" do
      %{
        url: _initial_url,
        username: initial_username,
        password: initial_password,
        ca_cert: _initial_ca_cert,
        ca_uploaded_at: _initial_ca_uploaded_at
      } =
        insert_software_updates_settings(
          ca_cert: build(:self_signed_certificate),
          ca_uploaded_at: DateTime.utc_now()
        )

      now = DateTime.utc_now()

      expect(
        Trento.Support.DateService.Mock,
        :utc_now,
        fn -> now end
      )

      change_submission = %{
        url: new_url = "https://new.com",
        ca_cert: new_ca_cert = build(:self_signed_certificate)
      }

      Enum.each(1..3, fn run_iteration ->
        change_result =
          case run_iteration do
            1 ->
              Settings.change_suse_manager_settings(
                change_submission,
                Trento.Support.DateService.Mock
              )

            _ ->
              Settings.change_suse_manager_settings(change_submission)
          end

        assert {:ok,
                %{
                  url: ^new_url,
                  username: ^initial_username,
                  password: ^initial_password,
                  ca_cert: ^new_ca_cert,
                  ca_uploaded_at: ^now
                }} = change_result
      end)
    end

    test "should properly remove ca_cert and its upload date" do
      %{
        url: initial_url,
        username: initial_username,
        password: initial_password,
        ca_cert: _initial_ca_cert,
        ca_uploaded_at: _initial_ca_uploaded_at
      } =
        insert_software_updates_settings(
          ca_cert: Faker.Lorem.sentence(),
          ca_uploaded_at: DateTime.utc_now()
        )

      change_submission = %{
        ca_cert: nil
      }

      assert {:ok,
              %{
                url: ^initial_url,
                username: ^initial_username,
                password: ^initial_password,
                ca_cert: nil,
                ca_uploaded_at: nil
              }} = Settings.change_suse_manager_settings(change_submission)
    end

    test "should reject an invalid SSL certificate" do
      insert_software_updates_settings(ca_cert: nil)

      change_submission = %{
        ca_cert: Faker.Lorem.word()
      }

      assert {:error,
              %{
                errors: [
                  ca_cert: {"unable to parse X.509 certificate", [validation: :ca_cert_parsing]}
                ]
              }} = Settings.change_suse_manager_settings(change_submission)
    end

    test "should reject a 'foobar' SSL certificate" do
      insert_software_updates_settings(ca_cert: nil)

      change_submission = %{
        ca_cert: """
        -----BEGIN CERTIFICATE-----
        foobar
        -----END CERTIFICATE-----
        """
      }

      assert {:error,
              %{
                errors: [
                  ca_cert: {"unable to parse X.509 certificate", [validation: :ca_cert_parsing]}
                ]
              }} = Settings.change_suse_manager_settings(change_submission)
    end

    test "should reject an expired SSL certificate" do
      insert_software_updates_settings(ca_cert: nil)

      change_submission = %{
        ca_cert: build(:self_signed_certificate, validity: 0)
      }

      assert {:error,
              %{
                errors: [
                  ca_cert: {"the X.509 certificate is not valid", [validation: :ca_cert_validity]}
                ]
              }} = Settings.change_suse_manager_settings(change_submission)
    end

    test "should support idempotent sequential clear settings" do
      insert_software_updates_settings(
        ca_cert: Faker.Lorem.sentence(),
        ca_uploaded_at: DateTime.utc_now()
      )

      assert {:ok, _} = Settings.get_suse_manager_settings()

      Enum.each(1..3, fn _ ->
        assert :ok == Settings.clear_suse_manager_settings()
        assert {:error, :settings_not_configured} == Settings.get_suse_manager_settings()
      end)
    end
  end
end
