# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Settings.ChecksExecutionSettingsTest do
  # Not async: tests change the :checks_execution application env
  use ExUnit.Case, async: false
  use Trento.DataCase

  alias Trento.Settings
  alias Trento.Settings.ChecksExecutionSettings

  setup do
    previous_env = Application.get_env(:trento, :checks_execution)
    on_exit(fn -> Application.put_env(:trento, :checks_execution, previous_env) end)
    Application.put_env(:trento, :checks_execution, interval: nil)

    :ok
  end

  test "should return the default interval when nothing is saved" do
    assert {:ok, %ChecksExecutionSettings{interval: 5, enforced_from_env: false}} =
             Settings.get_checks_execution_settings()
  end

  test "should save and return the interval" do
    assert {:ok, %ChecksExecutionSettings{interval: 60}} =
             Settings.update_checks_execution_settings(%{interval: 60})

    assert {:ok, %ChecksExecutionSettings{interval: 1440}} =
             Settings.update_checks_execution_settings(%{interval: 1440})

    assert {:ok, %ChecksExecutionSettings{interval: 1440, enforced_from_env: false}} =
             Settings.get_checks_execution_settings()
  end

  test "should reject an interval that is not allowed" do
    assert {:error, %Ecto.Changeset{}} = Settings.update_checks_execution_settings(%{interval: 7})
  end

  test "should enforce the interval set from the environment" do
    Application.put_env(:trento, :checks_execution, interval: 10)

    assert {:ok, %ChecksExecutionSettings{interval: 10, enforced_from_env: true}} =
             Settings.get_checks_execution_settings()

    assert {:error, :checks_execution_settings_enforced} =
             Settings.update_checks_execution_settings(%{interval: 60})
  end
end
