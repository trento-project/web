defmodule Trento.TagsTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Repo

  alias Trento.Tags

  describe "tags" do
    alias Trento.Tags.Tag

    test "add_tag/3 adds a tag to the desired resource" do
      value = Faker.StarWars.planet()
      resource_id = Faker.UUID.v4()
      type = "host"

      {:ok, %Tag{value: ^value, resource_id: ^resource_id, resource_type: :host}} =
        Tags.add_tag(value, resource_id, type)

      assert %Tag{value: ^value, resource_id: ^resource_id, resource_type: :host} =
               Repo.get_by(Tag, resource_id: resource_id)
    end

    test "add_tag/3 returns an error if the type is unknown" do
      value = Faker.StarWars.planet()
      resource_id = Faker.UUID.v4()
      type = "unknown"

      {:error, _} = Tags.add_tag(value, resource_id, type)

      assert nil == Repo.get_by(Tag, resource_id: resource_id)
    end

    test "delete_tag/2 deletes a tag from a given resource" do
      %Tag{value: value, resource_id: resource_id} = insert(:tag)
      :ok = Tags.delete_tag(value, resource_id)
      assert nil == Repo.get_by(Tag, resource_id: resource_id)
    end

    test "delete_tag/2 returns a not found error if the resource does not exist" do
      %Tag{value: value} = insert(:tag)
      {:error, :not_found} = Tags.delete_tag(value, Faker.UUID.v4())
    end
  end
end
