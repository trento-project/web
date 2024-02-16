defmodule Trento.SoftwareUpdates.SettingsTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox

  import Trento.Factory

  alias Trento.SoftwareUpdates
  alias Trento.SoftwareUpdates.Settings

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
        insert(:software_updates_settings, [ca_cert: nil, ca_uploaded_at: nil],
          conflict_target: :id,
          on_conflict: :replace_all
        )

      assert {:ok,
              %Settings{
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
        insert(
          :software_updates_settings,
          [ca_cert: Faker.Lorem.sentence(), ca_uploaded_at: DateTime.utc_now()],
          conflict_target: :id,
          on_conflict: :replace_all
        )

      assert {:ok,
              %Settings{
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
              %Settings{
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
              %Settings{
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
        ca_cert: ca_cert = Faker.Lorem.sentence()
      }

      assert {:ok,
              %Settings{
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
      insert(:software_updates_settings, [],
        conflict_target: :id,
        on_conflict: :replace_all
      )

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
        insert(
          :software_updates_settings,
          [ca_cert: Faker.Lorem.sentence(), ca_uploaded_at: DateTime.utc_now()],
          conflict_target: :id,
          on_conflict: :replace_all
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
        insert(
          :software_updates_settings,
          [ca_cert: Faker.Lorem.sentence(), ca_uploaded_at: DateTime.utc_now()],
          conflict_target: :id,
          on_conflict: :replace_all
        )

      change_submission = %{
        url: new_url = "https://new.com",
        ca_cert: new_ca_cert = "new_ca_cert"
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

    test "should properly remove ca_cert and its upload date" do
      %{
        url: initial_url,
        username: initial_username,
        password: initial_password,
        ca_cert: _initial_ca_cert,
        ca_uploaded_at: _initial_ca_uploaded_at
      } =
        insert(
          :software_updates_settings,
          [ca_cert: Faker.Lorem.sentence(), ca_uploaded_at: DateTime.utc_now()],
          conflict_target: :id,
          on_conflict: :replace_all
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
  end

  describe "clearing software update settings" do
    test "should support idempotent sequential clear settings" do
      insert(
        :software_updates_settings,
        [ca_cert: Faker.Lorem.sentence(), ca_uploaded_at: DateTime.utc_now()],
        conflict_target: :id,
        on_conflict: :replace_all
      )

      assert {:ok, _} = SoftwareUpdates.get_settings()

      Enum.each(1..3, fn _ ->
        assert :ok == SoftwareUpdates.clear_settings()
        assert {:error, :settings_not_configured} == SoftwareUpdates.get_settings()
      end)
    end
  end
end
