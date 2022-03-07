defmodule Tronto.Tasks.Helper do
  @moduledoc """
  Helper functions for tasks.
  """

  def start_repo do
    [:postgrex, :ecto]
    |> Enum.each(&Application.ensure_all_started/1)

    Tronto.Repo.start_link()
  end

  # This way we can use tasls
  def print_error(msg) do
    case Code.ensure_compiled(Mix) do
      {:module, _} -> Mix.raise(msg)
      {:error, _} -> IO.puts(IO.ANSI.red() <> msg)
    end
  end
end
