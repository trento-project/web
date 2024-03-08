defmodule Trento.SoftwareUpdates.Discovery.Gen do
  @moduledoc """
  Behaviour of the software updates discovery process.
  """

  @callback get_system_id(fully_qualified_domain_name :: String.t()) ::
              {:ok, pos_integer()} | {:error, any}

  @callback get_relevant_patches(system_id :: pos_integer()) ::
              {:ok, [map]} | {:error, any}

  @callback get_upgradable_packages(system_id :: pos_integer()) ::
              {:ok, [map]} | {:error, any}

  @callback clear() :: :ok
end
