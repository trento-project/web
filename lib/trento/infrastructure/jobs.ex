# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs do
  @moduledoc """
  Oban configuration. The checks execution entry of the crontab comes from
  its own configuration key, so that every environment can set it without
  repeating the whole crontab.
  """

  alias Trento.Infrastructure.Jobs.ChecksExecutionJob

  @spec oban_config() :: keyword()
  def oban_config do
    checks_cron = Application.fetch_env!(:trento, :checks_execution_cron)

    Application.fetch_env!(:trento, Oban)
    |> Keyword.update(:cron, [], fn cron ->
      Keyword.update(cron, :crontab, [], fn crontab ->
        [{checks_cron, ChecksExecutionJob, queue: :checks} | crontab]
      end)
    end)
  end
end
