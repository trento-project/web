defmodule Trento.SoftwareUpdates.SettingsTest do
  use ExUnit.Case
  use Trento.CommandedCase
  use Trento.DataCase
  use Trento.SoftwareUpdates.DiscoveryCase
  use Trento.TaskCase

  import Mox

  import Trento.Factory

  alias Trento.Hosts.Commands.CompleteSoftwareUpdatesDiscovery
  alias Trento.SoftwareUpdates
  alias Trento.Settings.SuseManagerSettings

  setup :verify_on_exit!

  describe "retrieving software updates settings" do
    test "should return an error when settings are not available" do
      assert {:error, :settings_not_configured} == SoftwareUpdates.get_settings()
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
              }} = SoftwareUpdates.get_settings()
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
              }} = SoftwareUpdates.get_settings()
    end
  end

  describe "saving software updates settings" do
    test "should not save invalid software updates settings" do
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
          assert {:error, %{errors: ^errors}} = SoftwareUpdates.save_settings(submission)
        end)
      end
    end

    test "should save software updates settings without ca cert" do
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
              }} = SoftwareUpdates.save_settings(settings)
    end

    test "should save software updates settings with a nil ca cert" do
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
              }} = SoftwareUpdates.save_settings(settings)
    end

    test "should save software updates settings with ca cert" do
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
              }} = SoftwareUpdates.save_settings(settings, Trento.Support.DateService.Mock)
    end

    test "should not save software updates settings if already saved" do
      settings = %{
        url: "https://valid.com",
        username: Faker.Internet.user_name(),
        password: Faker.Lorem.word(),
        ca_cert: nil
      }

      assert {:ok, _} = SoftwareUpdates.save_settings(settings)

      assert {:error, :settings_already_configured} = SoftwareUpdates.save_settings(settings)
    end

    test "should issue software updates discovery process when saving or updating settings" do
      insert_list(5, :host)
      insert(:host, deregistered_at: DateTime.to_iso8601(Faker.DateTime.backward(2)))

      operations = [
        &SoftwareUpdates.save_settings/1,
        &SoftwareUpdates.change_settings/1
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
  end

  describe "changing software updates settings" do
    test "should not be able to change software updates settings if none previously saved" do
      submission = %{
        url: "https://valid.com",
        username: Faker.Internet.user_name(),
        password: Faker.Lorem.word(),
        ca_cert: nil
      }

      assert {:error, :settings_not_configured} == SoftwareUpdates.change_settings(submission)
    end

    test "should validate partial changes to software updates settings" do
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
                   SoftwareUpdates.change_settings(change_submission)
        end)
      end
    end

    test "should support partial change of software updates settings" do
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
              }} = SoftwareUpdates.change_settings(change_submission)
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
               SoftwareUpdates.change_settings(change_submission, Trento.Support.DateService.Mock)
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
              SoftwareUpdates.change_settings(change_submission, Trento.Support.DateService.Mock)

            _ ->
              SoftwareUpdates.change_settings(change_submission)
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
              }} = SoftwareUpdates.change_settings(change_submission)
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
              }} = SoftwareUpdates.change_settings(change_submission)
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
              }} = SoftwareUpdates.change_settings(change_submission)
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
              }} = SoftwareUpdates.change_settings(change_submission)
    end
  end

  describe "clearing software update settings" do
    test "should support idempotent sequential clear settings" do
      insert_software_updates_settings(
        ca_cert: Faker.Lorem.sentence(),
        ca_uploaded_at: DateTime.utc_now()
      )

      assert {:ok, _} = SoftwareUpdates.get_settings()

      Enum.each(1..3, fn _ ->
        assert :ok == SoftwareUpdates.clear_settings()
        assert {:error, :settings_not_configured} == SoftwareUpdates.get_settings()
      end)
    end
  end

  describe "discovery" do
    test "should not start discovery if settings are not configured" do
      assert {:error, :settings_not_configured} = SoftwareUpdates.run_discovery()
    end

    test "should start discovery if settings are configured" do
      insert_software_updates_settings()
      insert_list(4, :host)

      assert :ok == SoftwareUpdates.run_discovery()
    end

    test "should trigger clearing of software updates discoveries when clearing settings" do
      insert_software_updates_settings()
      insert_list(4, :host)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :clear, 3, fn -> :ok end)

      Enum.each(1..3, fn _ ->
        assert :ok == SoftwareUpdates.clear_settings()
        assert {:error, :settings_not_configured} == SoftwareUpdates.get_settings()
      end)
    end
  end

  describe "getting software updates" do
    test "should fail when settings are not configured" do
      %{host_id: tracked_discovery_id} = insert(:software_updates_discovery_result)
      untracked_discovery_id = Faker.UUID.v4()

      for host_id <- [tracked_discovery_id, untracked_discovery_id] do
        assert {:error, :settings_not_configured} = SoftwareUpdates.get_software_updates(host_id)
      end
    end

    test "handles non existing discovery result" do
      insert_software_updates_settings()
      host_id = Faker.UUID.v4()

      assert {:error, :not_found} = SoftwareUpdates.get_software_updates(host_id)
    end

    test "successfully returns software updates" do
      insert_software_updates_settings()
      %{host_id: host_id} = insert(:software_updates_discovery_result)

      assert {:ok, %{relevant_patches: [_, _], upgradable_packages: [_, _]}} =
               SoftwareUpdates.get_software_updates(host_id)
    end

    test "returns errors on failed discoveries" do
      insert_software_updates_settings()

      %{host_id: host_id} =
        insert(:failed_software_updates_discovery_result)

      assert {:error, _} = SoftwareUpdates.get_software_updates(host_id)
    end
  end

  describe "getting related patches for some packages" do
    test "should return an aggregated list of packages and related patches" do
      insert_software_updates_settings()

      [first_package_id, second_package_id, _] =
        packages_ids = [Faker.UUID.v4(), Faker.UUID.v4(), Faker.UUID.v4()]

      first_patch = [build(:patch_for_package)]
      second_patch = [build(:patch_for_package)]

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_patches_for_package, 3, fn
        ^first_package_id ->
          {:ok, first_patch}

        ^second_package_id ->
          {:ok, second_patch}

        _ ->
          {:error, :some_error}
      end)

      assert {:ok,
              [
                %{package_id: ^first_package_id, patches: ^first_patch},
                %{package_id: ^second_package_id, patches: ^second_patch},
                %{package_id: _, patches: []}
              ]} =
               SoftwareUpdates.get_packages_patches(packages_ids)
    end
  end

  describe "testing connection settings" do
    test "should return an error when connection test fails" do
      expect(Trento.SoftwareUpdates.Discovery.Mock, :setup, fn -> {:error, :some_error} end)

      assert {:error, :connection_test_failed} = SoftwareUpdates.test_connection_settings()
    end

    test "should return ok when connection test succeeds" do
      expect(Trento.SoftwareUpdates.Discovery.Mock, :setup, fn -> :ok end)

      assert :ok == SoftwareUpdates.test_connection_settings()
    end
  end
end
