defmodule Trento.SapSystems do
  @moduledoc """
  Provides a set of functions to interact with SAP systems and HANA Databases.
  """

  import Ecto.Query

  alias Trento.{
    ApplicationInstanceReadModel,
    DatabaseInstanceReadModel,
    DatabaseReadModel,
    SapSystemReadModel
  }

  alias Trento.Repo

  @spec get_all_sap_systems :: [SapSystemReadModel.t()]
  def get_all_sap_systems do
    SapSystemReadModel
    |> where([s], is_nil(s.deregistered_at))
    |> order_by(asc: :sid)
    |> Repo.all()
    |> Repo.preload([
      :application_instances,
      :database_instances,
      :tags
    ])
  end

  @spec get_all_databases :: [DatabaseReadModel.t()]
  def get_all_databases do
    DatabaseReadModel
    |> order_by(asc: :sid)
    |> Repo.all()
    |> Repo.preload([
      :database_instances,
      :tags
    ])
  end

  @spec get_application_instances_by_host_id(String.t()) :: [ApplicationInstanceReadModel.t()]
  def get_application_instances_by_host_id(host_id) do
    ApplicationInstanceReadModel
    |> where([a], a.host_id == ^host_id)
    |> Repo.all()
  end

  @spec get_database_instances_by_host_id(String.t()) :: [DatabaseInstanceReadModel.t()]
  def get_database_instances_by_host_id(host_id) do
    DatabaseInstanceReadModel
    |> where([d], d.host_id == ^host_id)
    |> Repo.all()
  end
end
