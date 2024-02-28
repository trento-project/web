defmodule Trento.SettingsTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Settings

  alias Trento.Settings.{
    ApiKeySettings,
    InstallationSettings
  }

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
        |> InstallationSettings.changeset(%{installation_id: UUID.uuid4(), eula_accepted: true})
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
                api_key_created_at: ^creation_date,
                api_key_expire_at: ^expiration_date
              }} =
               %{jti: jti, api_key_created_at: creation_date, api_key_expire_at: expiration_date}
               |> Settings.create_api_key_settings()
    end

    test "should not create another ApiKeySettings if one is already present" do
      insert(:api_key_settings)

      assert {:error, errors} =
               Settings.create_api_key_settings(%{
                 jti: UUID.uuid4(),
                 api_key_expire_at: DateTime.utc_now(),
                 api_key_created_at: DateTime.utc_now()
               })

      assert errors_on(errors) == %{type: ["has already been taken"]}
    end

    test "should not create ApiKeySettings if jti and api_key_created_at fields are missing" do
      assert {:error, errors} = Settings.create_api_key_settings(%{})

      assert errors_on(errors) == %{
               jti: ["can't be blank"],
               api_key_created_at: ["can't be blank"]
             }
    end

    test "should return ApiKeySettings when present" do
      insert(:api_key_settings)

      assert {:ok, %ApiKeySettings{}} = Settings.get_api_key_settings()
    end

    test "should not return ApiKeySettings when not present" do
      assert {:error, :api_key_settings_missing} == Settings.get_api_key_settings()
    end

    test "should not update ApiKeySettings when they are not present" do
      assert {:error, :api_key_settings_missing} ==
               Settings.update_api_key_settings(DateTime.utc_now())
    end

    test "should update ApiKeySettings when they are present, with a new expiration and generated creation and jti" do
      %ApiKeySettings{
        jti: old_jti,
        api_key_created_at: old_api_key_created_at,
        api_key_expire_at: old_api_key_expire_at
      } = insert(:api_key_settings)

      new_expiration = DateTime.utc_now()

      {:ok,
       %ApiKeySettings{
         jti: new_jti,
         api_key_created_at: new_api_key_created_at,
         api_key_expire_at: new_api_key_expire_at
       }} = Settings.update_api_key_settings(new_expiration)

      refute new_jti == old_jti
      refute new_api_key_expire_at == old_api_key_expire_at
      refute new_api_key_created_at == old_api_key_created_at
      assert new_api_key_expire_at == new_expiration
    end
  end
end
