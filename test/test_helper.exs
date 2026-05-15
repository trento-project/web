# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

Mox.defmock(Trento.Commanded.Mock, for: Commanded.Application)

Application.put_env(:trento, Trento.Commanded, adapter: Trento.Commanded.Mock)

Mox.defmock(Trento.Infrastructure.Prometheus.Mock, for: Trento.Infrastructure.Prometheus.Gen)

Application.put_env(:trento, Trento.Infrastructure.Prometheus,
  adapter: Trento.Infrastructure.Prometheus.Mock
)

Mox.defmock(Trento.Infrastructure.Prometheus.Adapter.HttpClient.Mock,
  for: Trento.Infrastructure.Prometheus.Adapter.HttpClient
)

Mox.defmock(Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor.Mock,
  for: Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor
)

Application.put_env(:trento, Trento.Infrastructure.SoftwareUpdates.SumaApi,
  executor: Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor.Mock
)

Mox.defmock(Trento.SoftwareUpdates.Discovery.Mock, for: Trento.SoftwareUpdates.Discovery.Gen)

Application.put_env(:trento, Trento.SoftwareUpdates.Discovery,
  adapter: Trento.SoftwareUpdates.Discovery.Mock
)

Mox.defmock(Trento.Infrastructure.SoftwareUpdates.Auth.Mock,
  for: Trento.Infrastructure.SoftwareUpdates.Auth.Gen
)

Application.put_env(:trento, :correlations, Trento.ActivityLog.Correlations.TestCorrelations)

Application.put_env(:trento, Trento.Infrastructure.SoftwareUpdates.Suma,
  auth: Trento.Infrastructure.SoftwareUpdates.Auth.Mock
)

Mox.defmock(Trento.Infrastructure.Messaging.Adapter.Mock,
  for: Trento.Infrastructure.Messaging.Adapter.Gen
)

Application.put_env(
  :trento,
  Trento.Infrastructure.Messaging,
  adapter: Trento.Infrastructure.Messaging.Adapter.Mock
)

Mox.defmock(Trento.Infrastructure.ComponentVersions.Mock,
  for: Trento.Infrastructure.ComponentVersions.Gen
)

Application.put_env(:trento, :component_versions,
  adapter: Trento.Infrastructure.ComponentVersions.Mock
)

Mox.defmock(GenRMQ.Processor.Mock, for: GenRMQ.Processor)

Mox.defmock(Trento.Support.DateService.Mock, for: Trento.Support.DateService)

Mox.defmock(Joken.CurrentTime.Mock, for: Joken.CurrentTime)
Application.put_env(:joken, :current_time_adapter, Joken.CurrentTime.Mock)

Mox.defmock(Trento.AI.ApplicationConfigLoader.Mock,
  for: Trento.AI.ApplicationConfigLoader
)

test_ai_config =
  Keyword.put(
    Application.get_env(:trento, :ai),
    :application_config_loader,
    Trento.AI.ApplicationConfigLoader.Mock
  )

Application.put_env(:trento, :ai, test_ai_config)

# Mox doubles for the agentic_runtime adapter boundaries used by
# TrentoWeb.AIAssistantChannel. The Application.put_env override is
# NOT done globally here — Trento.Application calls
# `AgenticRuntime.start_runtime([])` at boot, which would hit the
# Mock without expectations and cascade-crash Trento.Repo. Tests
# that need the Mock opt in per-describe via
# `Application.put_env` + `on_exit` (see
# `test/trento_web/channels/ai_assistant_channel_test.exs`).
Mox.defmock(AgenticRuntime.Agents.ServerAdapter.Mock,
  for: AgenticRuntime.Agents.ServerAdapter
)

Mox.defmock(AgenticRuntime.Agents.SupervisorAdapter.Mock,
  for: AgenticRuntime.Agents.SupervisorAdapter
)

Application.ensure_all_started(:ex_machina, :faker)

if Application.get_env(:trento, :flaky_tests_detection)[:enabled?] == true do
  ExUnit.configure(formatters: [JUnitFormatter, ExUnit.CLIFormatter])
end

ExUnit.start(capture_log: true)
Ecto.Adapters.SQL.Sandbox.mode(Trento.Repo, :manual)
