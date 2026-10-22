# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.JobsTest do
  use ExUnit.Case, async: false
  use Trento.DataCase
  use Oban.Testing, repo: Trento.Repo

  import Mox
  import Trento.Factory

  alias Trento.Checks.V1.ExecutionRequested
  alias Trento.Infrastructure.Checks.AMQP.Publisher
  alias Trento.Infrastructure.Jobs.ChecksExecutionJob

  setup :verify_on_exit!

  test "every crontab entry has a valid expression and an existing worker" do
    crontab = Application.fetch_env!(:trento, Oban)[:cron][:crontab]

    assert length(crontab) == 5

    for {expression, worker, _opts} <- Enum.map(crontab, &with_opts/1) do
      assert {:ok, _} = Oban.Cron.Expression.parse(expression)
      assert {:module, ^worker} = Code.ensure_loaded(worker)
      assert function_exported?(worker, :perform, 1)
    end
  end

  test "the checks execution job requests the due checks executions" do
    %{id: host_id} = insert(:host)

    expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn Publisher,
                                                                      "executions",
                                                                      %ExecutionRequested{
                                                                        group_id: ^host_id
                                                                      } ->
      :ok
    end)

    assert :ok = perform_job(ChecksExecutionJob, %{})
  end

  defp with_opts({expression, worker}), do: {expression, worker, []}
  defp with_opts({_expression, _worker, _opts} = entry), do: entry
end
