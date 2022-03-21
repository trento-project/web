defmodule Trento.SapSystems do
  @moduledoc """
  Provides a set of functions to interact with SAP systems and HANA Databases.
  """

  alias Trento.{
    DatabaseReadModel,
    SapSystemReadModel
  }

  alias Trento.Repo

  @spec get_all_sap_systems :: [SapSystemReadModel.t()]
  def get_all_sap_systems do
    SapSystemReadModel
    |> Repo.all()
    |> Repo.preload(:application_instances)
    |> Repo.preload(:database_instances)
    |> Repo.preload(:tags)
  end

  @spec get_all_databases :: [map]
  def get_all_databases do
    DatabaseReadModel
    |> Repo.all()
    |> Repo.preload(:database_instances)
  end
end
