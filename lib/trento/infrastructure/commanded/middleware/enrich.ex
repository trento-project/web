defmodule Trento.Infrastructure.Commanded.Middleware.Enrich do
  @moduledoc """
  Command enrichment middleware.
  """

  @behaviour Commanded.Middleware

  import Commanded.Middleware.Pipeline
  require OpenTelemetry.Tracer, as: Tracer

  alias Commanded.Middleware.Pipeline
  alias Trento.Infrastructure.Commanded.Middleware.Enrichable

  def before_dispatch(%Pipeline{command: command} = pipeline) do
    Tracer.add_event("Enrich", [])

    case Enrichable.impl_for(command) do
      nil -> pipeline
      _ -> enrich(pipeline)
    end
  end

  defp enrich(%Pipeline{command: command, metadata: metadata} = pipeline) do
    case Enrichable.enrich(command, metadata) do
      {:ok, enriched_command} ->
        %Pipeline{pipeline | command: enriched_command}

      {:error, reason} ->
        pipeline
        |> respond({:error, reason})
        |> halt
    end
  end

  def after_dispatch(pipeline), do: pipeline
  def after_failure(pipeline), do: pipeline
end

defprotocol Trento.Infrastructure.Commanded.Middleware.Enrichable do
  def enrich(command, metadata)
end
