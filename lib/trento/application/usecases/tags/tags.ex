defmodule Trento.Tags do
  @moduledoc """
  Tag related functions
  """

  import Ecto.Query

  alias Trento.Tag

  alias Trento.Repo

  @type taggable_resource :: :host | :cluster | :sap_system | :database

  @spec add_tag(String.t(), Ecto.UUID.t(), taggable_resource) ::
          {:ok, Ecto.Schema.t()} | {:error, Ecto.Changeset.t()}
  def add_tag(value, resource_id, resource_type) do
    changeset =
      Tag.changeset(%Tag{}, %{
        value: String.trim(value),
        resource_id: resource_id,
        resource_type: resource_type
      })

    Repo.insert(changeset,
      conflict_target: [:value, :resource_id],
      on_conflict: :nothing
    )
  end

  @spec delete_tag(String.t(), Ecto.UUID.t()) :: :ok | {:error, :not_found}
  def delete_tag(value, resource_id) do
    query =
      from t in Tag,
        where: ^value == t.value and ^resource_id == t.resource_id

    case Repo.delete_all(query) do
      {1, _} -> :ok
      {0, _} -> {:error, :not_found}
    end
  end
end
