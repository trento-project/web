defmodule Trento.SoftwareUpdates.Discovery.Gen do
  @moduledoc """
  Behaviour of the software updates discovery process.
  """

  @callback setup() :: :ok | {:error, any()}

  @callback get_system_id(fully_qualified_domain_name :: String.t()) ::
              {:ok, pos_integer()} | {:error, any()}

  @callback get_relevant_patches(system_id :: pos_integer()) ::
              {:ok, [map()]} | {:error, any()}

  @callback get_upgradable_packages(system_id :: pos_integer()) ::
              {:ok, [map()]} | {:error, any()}

  @callback get_patches_for_package(package_id :: String.t()) ::
              {:ok, [map()]} | {:error, any()}

  @callback get_errata_details(advisory_name :: String.t()) ::
              {:ok, map()} | {:error, any()}

  @callback get_affected_systems(advisory_name :: String.t()) ::
              {:ok, [map()]} | {:error, any()}

  @callback get_cves(advisory_name :: String.t()) ::
              {:ok, [String.t()]} | {:error, any()}

  @callback get_affected_packages(advisory_name :: String.t()) ::
              {:ok, [map()]} | {:error, any()}

  @callback clear() :: :ok
end
