defmodule Mix.Tasks.PrintVersion do
  @moduledoc "The hello mix task: `mix help hello`"

  use Mix.Task

  @shortdoc "Print application version"
  def run(_args) do
    IO.puts(Mix.Project.config()[:version])
  end
end
