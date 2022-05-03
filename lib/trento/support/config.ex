import Config
defmodule Trento.Config do
  def db_name(name, env \\ config_env()) do
    if env == :prod do
      name
    end

    "#{name}_#{env}#{System.get_env("MIX_TEST_PARTITION")}"
  end
end
