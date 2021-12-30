defmodule Tronto.Support.Middleware.Validate do
  @moduledoc """
  Validation middleware
  """

  @behaviour Commanded.Middleware

  import Commanded.Middleware.Pipeline

  alias Commanded.Middleware.Pipeline

  def before_dispatch(%Pipeline{command: command} = pipeline) do
    case Vex.valid?(command) do
      true ->
        pipeline

      false ->
        failed_validation(pipeline)
    end
  end

  def after_dispatch(pipeline), do: pipeline
  def after_failure(pipeline), do: pipeline

  defp failed_validation(%Pipeline{command: command} = pipeline) do
    errors =
      command
      |> Vex.errors()
      |> merge_errors()

    pipeline
    |> respond({:error, {:validation_failure, errors}})
    |> halt
  end

  defp merge_errors(errors) do
    errors
    |> Enum.group_by(
      fn {_error, field, _type, _message} -> field end,
      fn {_error, _field, type, message} -> {type, message} end
    )
    |> Enum.map(fn
      {field, [by: nested_struct_errors]} ->
        {field, merge_errors(nested_struct_errors)}

      errors ->
        errors
    end)
    |> Map.new()
  end
end
