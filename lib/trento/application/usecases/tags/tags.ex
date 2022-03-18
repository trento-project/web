defmodule Trento.Tags do
  @moduledoc """
  Tag related functions
  """

  import Ecto.Query

  alias Trento.Tag

  alias Trento.Repo

  @spec create_tag(String.t(), Ecto.UUID.t(), String.t()) ::
          {:ok, Ecto.Schema.t()} | {:error, Ecto.Changeset.t()}
  def create_tag(value, resource_id, resource_type) do
    Repo.insert(%Tag{value: value, resource_id: resource_id, resource_type: resource_type},
      conflict_target: [:value, :resource_id],
      on_conflict: :nothing
    )
  end

  @spec delete_tag(String.t(), Ecto.UUID.t()) :: :ok | {:error, :not_found}
  def delete_tag(value, resource_id) do
    query =
      from t in Tag,
        where: ^value == t.value and ^resource_id == t.resource_id

    tag = Repo.one(query)

    case Repo.delete(tag) do
      {:ok, _} -> :ok
      {:error, _} -> :not_found
    end
  end
end
