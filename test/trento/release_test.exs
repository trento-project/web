defmodule Trento.ReleaseTest do
  @moduledoc false
  use ExUnit.Case, async: false
  use Trento.DataCase

  import Trento.Factory

  require Trento.ActivityLog.RetentionPeriodUnit, as: RetentionPeriodUnit

  alias Trento.Release

  alias Trento.ActivityLog.RetentionTime
  alias Trento.ActivityLog.Settings, as: ActivityLogSettings
  alias Trento.Settings.SSOCertificatesSettings

  describe "Activity Log settings initiation" do
    test "should init default activity log retention time" do
      Release.init_default_activity_log_retention_time()

      assert %ActivityLogSettings{
               retention_time: %RetentionTime{
                 value: 1,
                 unit: RetentionPeriodUnit.month()
               }
             } = Trento.Repo.one(ActivityLogSettings.base_query())
    end

    test "should not change previously saved retention time" do
      value = 3
      unit = RetentionPeriodUnit.week()

      insert(:activity_log_settings,
        retention_time: %{
          value: value,
          unit: unit
        }
      )

      Release.init_default_activity_log_retention_time()

      assert %ActivityLogSettings{
               retention_time: %RetentionTime{
                 value: ^value,
                 unit: ^unit
               }
             } = Trento.Repo.one(ActivityLogSettings.base_query())
    end
  end

  describe "SAML initialization" do
    setup do
      temp_dir = Path.join([System.tmp_dir!(), ".trento_test"])
      File.mkdir_p!(temp_dir)
      previous_env = System.get_env()

      on_exit(fn ->
        System.put_env(previous_env)
        File.rm_rf!(temp_dir)
      end)

      {:ok, temp_dir: temp_dir}
    end

    test "should not initialize SAML if it is not enabled" do
      assert :ok = Release.maybe_init_saml(false)
    end

    test "should fail if TRENTO_WEB_ORIGIN variable is not set" do
      System.delete_env("TRENTO_WEB_ORIGIN")

      assert_raise RuntimeError,
                   """
                   environment variable TRENTO_WEB_ORIGIN is missing.
                   For example: yourdomain.example.com
                   """,
                   fn -> Release.maybe_init_saml(true) end
    end

    test "should create and store SSO certificates if they are not present", %{temp_dir: temp_dir} do
      System.put_env("TRENTO_WEB_ORIGIN", "localhost")
      System.put_env("SAML_SP_DIR", temp_dir)
      System.put_env("SAML_METADATA_CONTENT", "some xml")

      assert :ok = Release.maybe_init_saml(true)

      %{key_file: key, certificate_file: cert} =
        Trento.Repo.one(SSOCertificatesSettings.base_query())

      assert cert == File.read!(Path.join([temp_dir, "cert", "saml.pem"]))
      assert key == File.read!(Path.join([temp_dir, "cert", "saml_key.pem"]))
      assert "some xml" == File.read!(Path.join([temp_dir, "metadata.xml"]))
    end

    test "should reuse existing SSO certificates if they are present", %{temp_dir: temp_dir} do
      System.put_env("TRENTO_WEB_ORIGIN", "localhost")
      System.put_env("SAML_SP_DIR", temp_dir)
      System.put_env("SAML_METADATA_CONTENT", "some xml")

      %{key_file: key, certificate_file: cert} = insert(:sso_certificates_settings)

      assert :ok = Release.maybe_init_saml(true)

      assert cert == File.read!(Path.join([temp_dir, "cert", "saml.pem"]))
      assert key == File.read!(Path.join([temp_dir, "cert", "saml_key.pem"]))
      assert "some xml" == File.read!(Path.join([temp_dir, "metadata.xml"]))
    end

    test "should fail if none of metadata obtaining options are used", %{temp_dir: temp_dir} do
      System.put_env("TRENTO_WEB_ORIGIN", "localhost")
      System.put_env("SAML_SP_DIR", temp_dir)
      System.delete_env("SAML_METADATA_CONTENT")

      assert_raise RuntimeError,
                   "One of SAML_METADATA_URL or SAML_METADATA_CONTENT must be provided",
                   fn -> Release.maybe_init_saml(true) end
    end
  end
end
