# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

# The scheduling contract. Every backend implementation serves these schemas,
# so the frontend does not depend on how schedules are stored or run.

defmodule TrentoWeb.OpenApi.V1.Schema.Scheduling.Recurrence do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "RecurrenceV1",
      description:
        "How a schedule repeats, in the local time of its timezone. Null for a one-time schedule.",
      type: :object,
      nullable: true,
      additionalProperties: false,
      properties: %{
        frequency: %Schema{type: :string, enum: ["daily", "weekly", "monthly", "yearly"]},
        interval: %Schema{
          type: :integer,
          minimum: 1,
          description: "Repeat every X days, weeks, months or years."
        },
        weekdays: %Schema{
          type: :array,
          items: %Schema{type: :integer, minimum: 1, maximum: 7},
          description:
            "Weekly recurrences: ISO week days, 1 Monday to 7 Sunday. Empty means the week day of the start."
        },
        ends_on: %Schema{
          type: :string,
          format: :date,
          nullable: true,
          description: "No occurrence on this local date or after it."
        },
        max_occurrences: %Schema{
          type: :integer,
          minimum: 1,
          nullable: true,
          description: "No occurrence after this number of occurrences."
        }
      },
      required: [:frequency, :interval],
      example: %{
        frequency: "weekly",
        interval: 2,
        weekdays: [6, 7],
        ends_on: nil,
        max_occurrences: 5
      }
    },
    struct?: false
  )
end

defmodule TrentoWeb.OpenApi.V1.Schema.Scheduling.ExceptionWindow do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema
  alias TrentoWeb.OpenApi.V1.Schema.Scheduling.Recurrence

  OpenApiSpex.schema(
    %{
      title: "ChecksExceptionWindowV1",
      description:
        "Time window in which checks are not executed against a target. One-time when recurrence is null.",
      type: :object,
      nullable: true,
      additionalProperties: false,
      properties: %{
        starts_at: %Schema{type: :string, format: :"date-time"},
        timezone: %Schema{type: :string, example: "Europe/Berlin"},
        duration_minutes: %Schema{type: :integer, minimum: 1},
        recurrence: Recurrence
      },
      required: [:starts_at, :timezone, :duration_minutes],
      example: %{
        starts_at: "2026-11-02T22:00:00Z",
        timezone: "Europe/Berlin",
        duration_minutes: 120,
        recurrence: %{frequency: "weekly", interval: 1, weekdays: [1, 5]}
      }
    },
    struct?: false
  )
end

defmodule TrentoWeb.OpenApi.V1.Schema.Scheduling.ChecksSchedule do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema
  alias TrentoWeb.OpenApi.V1.Schema.Scheduling.ExceptionWindow

  @intervals ~w(5m 15m 30m 1h 6h 12h 24h 1w 2w 4w disabled)

  OpenApiSpex.schema(
    %{
      title: "ChecksScheduleV1",
      description: "Checks execution settings of a host or cluster.",
      type: :object,
      additionalProperties: false,
      properties: %{
        interval: %Schema{
          type: :string,
          enum: @intervals,
          nullable: true,
          description: "Interval of the target. Null when the target uses the global interval."
        },
        effective_interval: %Schema{type: :string, enum: @intervals},
        global_interval: %Schema{type: :string, enum: @intervals},
        last_requested_at: %Schema{
          type: :string,
          format: :"date-time",
          nullable: true,
          description: "Last periodic checks execution request for the target."
        },
        next_execution_at: %Schema{
          type: :string,
          format: :"date-time",
          nullable: true,
          description: "Null when periodic executions are disabled for the target."
        },
        exception_window: ExceptionWindow,
        in_exception_window: %Schema{type: :boolean}
      },
      required: [
        :interval,
        :effective_interval,
        :global_interval,
        :last_requested_at,
        :next_execution_at,
        :exception_window,
        :in_exception_window
      ],
      example: %{
        interval: "6h",
        effective_interval: "6h",
        global_interval: "15m",
        last_requested_at: "2026-11-02T10:00:00Z",
        next_execution_at: "2026-11-02T16:00:00Z",
        exception_window: nil,
        in_exception_window: false
      }
    },
    struct?: false
  )
end

defmodule TrentoWeb.OpenApi.V1.Schema.Scheduling.UpdateChecksScheduleRequest do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema
  alias TrentoWeb.OpenApi.V1.Schema.Scheduling.ExceptionWindow

  @intervals ~w(5m 15m 30m 1h 6h 12h 24h 1w 2w 4w disabled)

  OpenApiSpex.schema(
    %{
      title: "UpdateChecksScheduleRequestV1",
      description:
        "New checks execution settings of a host or cluster. Both values replace the current ones.",
      type: :object,
      additionalProperties: false,
      properties: %{
        interval: %Schema{
          type: :string,
          enum: @intervals,
          nullable: true,
          description: "Null to use the global interval."
        },
        exception_window: ExceptionWindow
      },
      required: [:interval, :exception_window],
      example: %{interval: nil, exception_window: nil}
    },
    struct?: false
  )
end

defmodule TrentoWeb.OpenApi.V1.Schema.Scheduling.PolicyWarning do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "OperationPolicyWarningV1",
      description:
        "A policy that does not pass now. The schedule is saved anyway: the policies run again at the scheduled time.",
      type: :object,
      additionalProperties: false,
      properties: %{
        message: %Schema{type: :string},
        metadata: %Schema{type: :array, items: %Schema{type: :object}}
      },
      required: [:message, :metadata],
      example: %{message: "Trento agent is not currently running in the host", metadata: []}
    },
    struct?: false
  )
end

defmodule TrentoWeb.OpenApi.V1.Schema.Scheduling.OperationSchedule do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema
  alias TrentoWeb.OpenApi.V1.Schema.Scheduling.{PolicyWarning, Recurrence}

  @operations ~w(reboot cluster_maintenance_change sap_system_start sap_system_stop sap_instance_start sap_instance_stop database_start database_stop)

  OpenApiSpex.schema(
    %{
      title: "OperationScheduleV1",
      description: "One-time or periodic schedule of an operation on a target.",
      type: :object,
      additionalProperties: false,
      properties: %{
        id: %Schema{type: :string, format: :uuid},
        target_type: %Schema{type: :string, enum: ["host", "cluster", "sap_system", "database"]},
        target_id: %Schema{type: :string, format: :uuid},
        operation: %Schema{type: :string, enum: @operations},
        params: %Schema{
          type: :object,
          description:
            "Operation params, as in the immediate request. SAP instance operations add host_id and instance_number."
        },
        starts_at: %Schema{type: :string, format: :"date-time"},
        timezone: %Schema{type: :string, example: "Europe/Berlin"},
        recurrence: Recurrence,
        next_run_at: %Schema{type: :string, format: :"date-time"},
        occurrences: %Schema{type: :integer, minimum: 0},
        bulk_id: %Schema{type: :string, format: :uuid, nullable: true},
        created_by: %Schema{type: :string, nullable: true},
        inserted_at: %Schema{type: :string, format: :"date-time"},
        updated_at: %Schema{type: :string, format: :"date-time"},
        warnings: %Schema{
          type: :array,
          items: PolicyWarning,
          description: "Only in the answers to a create or change."
        }
      },
      required: [
        :id,
        :target_type,
        :target_id,
        :operation,
        :params,
        :starts_at,
        :timezone,
        :recurrence,
        :next_run_at,
        :occurrences,
        :bulk_id,
        :created_by,
        :inserted_at,
        :updated_at
      ],
      example: %{
        id: "0e6c8a2d-5d4e-4f41-9a0a-3b6c3f1a2e11",
        target_type: "host",
        target_id: "9cd46919-5f19-59aa-993e-cf3736c71053",
        operation: "reboot",
        params: %{},
        starts_at: "2026-11-07T02:00:00Z",
        timezone: "Europe/Berlin",
        recurrence: %{frequency: "weekly", interval: 2, weekdays: [6, 7], max_occurrences: 5},
        next_run_at: "2026-11-07T02:00:00Z",
        occurrences: 0,
        bulk_id: nil,
        created_by: "admin",
        inserted_at: "2026-11-02T10:00:00Z",
        updated_at: "2026-11-02T10:00:00Z"
      }
    },
    struct?: false
  )
end

defmodule TrentoWeb.OpenApi.V1.Schema.Scheduling.OperationScheduleCollection do
  @moduledoc false

  require OpenApiSpex
  alias TrentoWeb.OpenApi.V1.Schema.Scheduling.OperationSchedule

  OpenApiSpex.schema(
    %{
      title: "OperationScheduleCollectionV1",
      description: "Schedules of a target, the next one first.",
      type: :array,
      items: OperationSchedule
    },
    struct?: false
  )
end

defmodule TrentoWeb.OpenApi.V1.Schema.Scheduling.CreateOperationScheduleRequest do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema
  alias TrentoWeb.OpenApi.V1.Schema.Scheduling.Recurrence

  @operations ~w(reboot cluster_maintenance_change sap_system_start sap_system_stop sap_instance_start sap_instance_stop database_start database_stop)

  OpenApiSpex.schema(
    %{
      title: "CreateOperationScheduleRequestV1",
      description: "Schedules an operation on a target.",
      type: :object,
      additionalProperties: false,
      properties: %{
        target_type: %Schema{type: :string, enum: ["host", "cluster", "sap_system", "database"]},
        target_id: %Schema{type: :string, format: :uuid},
        operation: %Schema{type: :string, enum: @operations},
        params: %Schema{type: :object},
        starts_at: %Schema{type: :string, format: :"date-time"},
        timezone: %Schema{type: :string},
        recurrence: Recurrence
      },
      required: [:target_type, :target_id, :operation, :starts_at, :timezone],
      example: %{
        target_type: "cluster",
        target_id: "5284d2c5-8e1c-5bbf-9eac-9e9b3a3d2b40",
        operation: "cluster_maintenance_change",
        params: %{maintenance: true},
        starts_at: "2026-11-07T02:00:00Z",
        timezone: "Europe/Berlin",
        recurrence: nil
      }
    },
    struct?: false
  )
end

defmodule TrentoWeb.OpenApi.V1.Schema.Scheduling.UpdateOperationScheduleRequest do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema
  alias TrentoWeb.OpenApi.V1.Schema.Scheduling.Recurrence

  OpenApiSpex.schema(
    %{
      title: "UpdateOperationScheduleRequestV1",
      description:
        "Replaces when and how a scheduled operation runs. The occurrence count restarts.",
      type: :object,
      additionalProperties: false,
      properties: %{
        params: %Schema{type: :object},
        starts_at: %Schema{type: :string, format: :"date-time"},
        timezone: %Schema{type: :string},
        recurrence: Recurrence
      },
      required: [:starts_at, :timezone],
      example: %{
        params: %{},
        starts_at: "2026-11-08T03:00:00Z",
        timezone: "Europe/Berlin",
        recurrence: %{frequency: "daily", interval: 1}
      }
    },
    struct?: false
  )
end

defmodule TrentoWeb.OpenApi.V1.Schema.Scheduling.BulkCreateOperationScheduleRequest do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema
  alias TrentoWeb.OpenApi.V1.Schema.Scheduling.Recurrence

  @operations ~w(reboot cluster_maintenance_change sap_system_start sap_system_stop database_start database_stop)

  OpenApiSpex.schema(
    %{
      title: "BulkCreateOperationScheduleRequestV1",
      description:
        "Schedules the same operation on several targets of one type. Creates one schedule per target.",
      type: :object,
      additionalProperties: false,
      properties: %{
        target_type: %Schema{type: :string, enum: ["host", "cluster", "sap_system", "database"]},
        target_ids: %Schema{
          type: :array,
          items: %Schema{type: :string, format: :uuid},
          minItems: 1,
          uniqueItems: true
        },
        operation: %Schema{type: :string, enum: @operations},
        params: %Schema{type: :object},
        starts_at: %Schema{type: :string, format: :"date-time"},
        timezone: %Schema{type: :string},
        recurrence: Recurrence
      },
      required: [:target_type, :target_ids, :operation, :starts_at, :timezone],
      example: %{
        target_type: "host",
        target_ids: [
          "9cd46919-5f19-59aa-993e-cf3736c71053",
          "b767b3e9-e802-587e-a442-541d093b86b9"
        ],
        operation: "reboot",
        params: %{},
        starts_at: "2026-11-07T02:00:00Z",
        timezone: "Europe/Berlin",
        recurrence: %{frequency: "monthly", interval: 1}
      }
    },
    struct?: false
  )
end

defmodule TrentoWeb.OpenApi.V1.Schema.Scheduling.BulkOperationSchedules do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema
  alias TrentoWeb.OpenApi.V1.Schema.Scheduling.OperationSchedule

  OpenApiSpex.schema(
    %{
      title: "BulkOperationSchedulesV1",
      description: "Schedules created by a bulk request, all with the same bulk_id.",
      type: :object,
      additionalProperties: false,
      properties: %{
        bulk_id: %Schema{type: :string, format: :uuid},
        schedules: %Schema{type: :array, items: OperationSchedule}
      },
      required: [:bulk_id, :schedules]
    },
    struct?: false
  )
end
