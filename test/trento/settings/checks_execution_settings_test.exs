defmodule Trento.Settings.ChecksExecutionSettingsTest do
  use ExUnit.Case, async: false
  use Trento.DataCase

  import ExUnit.CaptureLog

  alias Trento.Settings
  alias Trento.Settings.ChecksExecutionSettings

  setup do
    previous = Application.get_env(:trento, :checks_execution)
    on_exit(fn -> Application.put_env(:trento, :checks_execution, previous) end)
    Application.put_env(:trento, :checks_execution, interval: nil)
  end

  test "should return the default interval when nothing is saved" do
    assert %ChecksExecutionSettings{interval: "5m", enforced_from_env: false} ==
             Settings.get_checks_execution_settings()
  end

  test "should save and return the interval" do
    assert {:ok, %ChecksExecutionSettings{interval: "6h", enforced_from_env: false}} =
             Settings.update_checks_execution_settings(%{interval: "6h"})

    assert {:ok, %ChecksExecutionSettings{interval: "disabled"}} =
             Settings.update_checks_execution_settings(%{interval: "disabled"})

    assert %ChecksExecutionSettings{interval: "disabled"} =
             Settings.get_checks_execution_settings()
  end

  test "should refuse an interval that is not allowed" do
    assert {:error, %Ecto.Changeset{errors: [interval: _]}} =
             Settings.update_checks_execution_settings(%{interval: "7m"})
  end

  test "should enforce the interval of the environment" do
    Application.put_env(:trento, :checks_execution, interval: "15")

    assert %ChecksExecutionSettings{interval: "15m", enforced_from_env: true} ==
             Settings.get_checks_execution_settings()

    assert {:error, :checks_execution_settings_enforced} ==
             Settings.update_checks_execution_settings(%{interval: "1h"})
  end

  test "should ignore an environment interval that is not allowed" do
    Application.put_env(:trento, :checks_execution, interval: "7")
    {:ok, _} = Settings.update_checks_execution_settings(%{interval: "30m"})

    log =
      capture_log(fn ->
        assert %ChecksExecutionSettings{interval: "30m", enforced_from_env: false} =
                 Settings.get_checks_execution_settings()
      end)

    assert log =~ "CHECKS_INTERVAL"
  end
end
