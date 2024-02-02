defmodule Trento.SoftwareUpdates.SettingsTest do
  use ExUnit.Case
  use Trento.DataCase

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
            %{
              url: ^url,
              username: ^username,
              password: ^password,
              ca_cert: ^ca_cert,
              ca_uploaded_at: ^ca_uploaded_at
            }} = SoftwareUpdates.get_settings()
  end
end
