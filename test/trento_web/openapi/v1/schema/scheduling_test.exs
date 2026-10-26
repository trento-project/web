defmodule TrentoWeb.OpenApi.V1.Schema.SchedulingTest do
  use ExUnit.Case, async: true

  import OpenApiSpex.TestAssertions

  alias OpenApiSpex.{Cast, Components, Info, OpenApi}

  alias TrentoWeb.OpenApi.V1.Schema.Scheduling.{
    BulkCreateOperationScheduleRequest,
    BulkOperationSchedules,
    ChecksSchedule,
    CreateOperationScheduleRequest,
    ExceptionWindow,
    OperationSchedule,
    OperationScheduleCollection,
    PolicyWarning,
    Recurrence,
    UpdateChecksScheduleRequest,
    UpdateOperationScheduleRequest
  }

  @schemas [
    BulkCreateOperationScheduleRequest,
    BulkOperationSchedules,
    ChecksSchedule,
    CreateOperationScheduleRequest,
    ExceptionWindow,
    OperationSchedule,
    OperationScheduleCollection,
    PolicyWarning,
    Recurrence,
    UpdateChecksScheduleRequest,
    UpdateOperationScheduleRequest
  ]

  setup_all do
    spec =
      OpenApiSpex.resolve_schema_modules(%OpenApi{
        info: %Info{title: "scheduling contract", version: "1"},
        paths: %{},
        components: %Components{
          schemas: Map.new(@schemas, &{&1.schema().title, &1.schema()})
        }
      })

    %{spec: spec}
  end

  test "should validate the example of every schema", %{spec: spec} do
    for module <- @schemas, example = module.schema().example, not is_nil(example) do
      assert_schema(example, module.schema().title, spec)
    end
  end

  test "should accept null for a one-time schedule and for no exception window", %{spec: spec} do
    assert_schema(
      %{interval: nil, exception_window: nil},
      "UpdateChecksScheduleRequestV1",
      spec
    )

    assert_schema(
      %{
        target_type: "host",
        target_id: UUID.uuid4(),
        operation: "reboot",
        starts_at: "2026-11-07T02:00:00Z",
        timezone: "Etc/UTC",
        recurrence: nil
      },
      "CreateOperationScheduleRequestV1",
      spec
    )
  end

  test "should refuse values outside the contract", %{spec: spec} do
    for {value, title} <- [
          {%{interval: "7m", exception_window: nil}, "UpdateChecksScheduleRequestV1"},
          {%{frequency: "hourly", interval: 1}, "RecurrenceV1"},
          {%{frequency: "weekly", interval: 1, weekdays: [8]}, "RecurrenceV1"},
          {%{frequency: "daily", interval: 0}, "RecurrenceV1"},
          {%{
             target_type: "host",
             target_id: UUID.uuid4(),
             operation: "saptune_solution_apply",
             starts_at: "2026-11-07T02:00:00Z",
             timezone: "Etc/UTC"
           }, "CreateOperationScheduleRequestV1"},
          {%{
             target_type: "host",
             target_ids: [],
             operation: "reboot",
             starts_at: "2026-11-07T02:00:00Z",
             timezone: "Etc/UTC"
           }, "BulkCreateOperationScheduleRequestV1"}
        ] do
      schema = spec.components.schemas[title]
      assert {:error, _} = Cast.cast(schema, value, spec.components.schemas)
    end
  end
end
