defmodule Trento.Tags do
  @moduledoc """
  Tag related functions
  """

  import Ecto.Query

  alias Trento.Tag

  alias Trento.Repo

  @type taggable_resource :: :host | :cluster | :sap_system | :database

  @spec create_tag(String.t(), Ecto.UUID.t(), taggable_resource) ::
          {:ok, Ecto.Schema.t()} | {:error, any}
  def create_tag(value, resource_id, resource_type) do
    changeset =
      Tag.changeset(%Tag{}, %{
        value: String.trim(value),
        resource_id: resource_id,
        resource_type: resource_type
      })

    case Repo.insert(changeset,
           conflict_target: [:value, :resource_id],
           on_conflict: :nothing
         ) do
      {:ok, _} = result ->
        result

      {:error, changeset} ->
        {:error,
         Ecto.Changeset.traverse_errors(
           changeset,
           fn {msg, _} -> msg end
         )}
    end
  end

  @spec delete_tag(String.t(), Ecto.UUID.t()) :: :ok | :not_found
  def delete_tag(value, resource_id) do
    query =
      from t in Tag,
        where: ^value == t.value and ^resource_id == t.resource_id

    case Repo.delete_all(query) do
      {1, _} -> :ok
      {0, _} -> :not_found
    end
  end
end
