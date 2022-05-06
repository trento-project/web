defmodule Trento.Config do
  @moduledoc """
  Configuration helper functions
  """

  @doc """
  retrieve an environment configuration setting from the system environment
  using existing Application configuration as fallback
  """
  def fallback(config_path) do
    :trento |> Application.get_all_env() |> get_in(config_path)
  end

  def get_env_int(env_var, default \\ nil) do
    value = System.get_env(env_var, default)

    if is_nil(value) do
      value
    else
      String.to_integer(value)
    end
  end

  def get_env_bool(env_var, default \\ nil) do
    value = System.get_env(env_var, default)

    cond do
      is_nil(value) -> nil
      value in ["true", "1", "yes"] -> true
      value in ["false", "0", "no"] -> false
      true -> raise "Cannot parse #{env_var} boolean value from '#{value}'"
    end
  end
end
