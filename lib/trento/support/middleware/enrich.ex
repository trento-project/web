defmodule Trento.Support.Middleware.Enrich do
  @moduledoc """
  Command enrichment middleware.
  """

  @behaviour Commanded.Middleware

  import Commanded.Middleware.Pipeline

  alias Commanded.Middleware.Pipeline
  alias Trento.Support.Middleware.Enrichable

  def before_dispatch(%Pipeline{command: command} = pipeline) do
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

defprotocol Trento.Support.Middleware.Enrichable do
  def enrich(command, metadata)
end
