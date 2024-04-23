defmodule Trento.AbilitiesTest do
  use Trento.DataCase

  alias Trento.Abilities

  describe "abilities" do
    alias Trento.Abilities.Ability

    import Trento.AbilitiesFixtures

    @invalid_attrs %{label: nil, name: nil, resource: nil}

    test "list_abilities/0 returns all abilities" do
      ability = ability_fixture()
      assert Abilities.list_abilities() == [ability]
    end

    test "get_ability!/1 returns the ability with given id" do
      ability = ability_fixture()
      assert Abilities.get_ability!(ability.id) == ability
    end

    test "create_ability/1 with valid data creates a ability" do
      valid_attrs = %{label: "some label", name: "some name", resource: "some resource"}

      assert {:ok, %Ability{} = ability} = Abilities.create_ability(valid_attrs)
      assert ability.label == "some label"
      assert ability.name == "some name"
      assert ability.resource == "some resource"
    end

    test "create_ability/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Abilities.create_ability(@invalid_attrs)
    end

    test "update_ability/2 with valid data updates the ability" do
      ability = ability_fixture()
      update_attrs = %{label: "some updated label", name: "some updated name", resource: "some updated resource"}

      assert {:ok, %Ability{} = ability} = Abilities.update_ability(ability, update_attrs)
      assert ability.label == "some updated label"
      assert ability.name == "some updated name"
      assert ability.resource == "some updated resource"
    end

    test "update_ability/2 with invalid data returns error changeset" do
      ability = ability_fixture()
      assert {:error, %Ecto.Changeset{}} = Abilities.update_ability(ability, @invalid_attrs)
      assert ability == Abilities.get_ability!(ability.id)
    end

    test "delete_ability/1 deletes the ability" do
      ability = ability_fixture()
      assert {:ok, %Ability{}} = Abilities.delete_ability(ability)
      assert_raise Ecto.NoResultsError, fn -> Abilities.get_ability!(ability.id) end
    end

    test "change_ability/1 returns a ability changeset" do
      ability = ability_fixture()
      assert %Ecto.Changeset{} = Abilities.change_ability(ability)
    end
  end
end
