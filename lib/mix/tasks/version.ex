# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Mix.Tasks.Version do
  @moduledoc "Print application version."

  use Mix.Task

  @shortdoc "Print application version"
  def run(_args) do
    IO.puts(Mix.Project.config()[:version])
  end
end
