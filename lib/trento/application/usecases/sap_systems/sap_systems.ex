defmodule Trento.SapSystems do
  @moduledoc """
  Provides a set of functions to interact with SAP systems and HANA Databases.
  """

  import Ecto.Query

  alias Trento.{
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

  @spec get_all_databases :: [map]
  def get_all_databases do
    DatabaseReadModel
    |> order_by(asc: :sid)
    |> Repo.all()
    |> Repo.preload([
      :database_instances,
      :tags
    ])
  end
end
