defmodule Trento.SoftwareUpdates.SettingsTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox

  import Trento.Factory

  alias Trento.SoftwareUpdates

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
            %{
              url: url,
              username: username,
              password: password,
              ca_cert: nil,
              ca_uploaded_at: nil
            }} == SoftwareUpdates.get_settings()
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
            %{
              url: url,
              username: username,
              password: password,
              ca_cert: ca_cert,
              ca_uploaded_at: ca_uploaded_at
            }} == SoftwareUpdates.get_settings()
  end

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
            %{
              url: url,
              username: username,
              password: password,
              ca_cert: nil,
              ca_uploaded_at: nil
            }} == SoftwareUpdates.save_settings(settings)
  end

  test "should save software updates settings with a nil ca cert" do
    settings = %{
      url: url = "https://valid.com",
      username: username = Faker.Internet.user_name(),
      password: password = Faker.Lorem.word(),
      ca_cert: nil
    }

    assert {:ok,
            %{
              url: url,
              username: username,
              password: password,
              ca_cert: nil,
              ca_uploaded_at: nil
            }} == SoftwareUpdates.save_settings(settings)
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
            %{
              url: url,
              username: username,
              password: password,
              ca_cert: ca_cert,
              ca_uploaded_at: now
            }} == SoftwareUpdates.save_settings(settings, Trento.Support.DateService.Mock)
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
