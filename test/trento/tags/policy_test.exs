defmodule Trento.Tags.PolicyTest do
  use ExUnit.Case

  alias Trento.Tags.Policy
  alias Trento.Tags.Tag
  alias Trento.Users.User

  test "should allow any action when the user has global ability" do
    user = %User{abilities: [%{resource: "all", name: "all"}]}

    Enum.each([:cluster, :host, :sap_system, :database], fn tag_resource ->
      assert Policy.authorize(:add_tag, user, %{tag_resource: tag_resource, resource: Tag})
    end)
  end

  test "should not allow add_tag action on the resource when the user does not have the right ability" do
    user = %User{abilities: []}

    Enum.each([:cluster, :host, :sap_system, :database], fn tag_resource ->
      refute Policy.authorize(:add_tag, user, %{tag_resource: tag_resource, resource: Tag})
    end)
  end

  test "should not allow delete_tag action on the resource when the user does not have the right ability" do
    user = %User{abilities: []}

    Enum.each([:cluster, :host, :sap_system, :database], fn tag_resource ->
      refute Policy.authorize(:delete_tag, user, %{tag_resource: tag_resource, resource: Tag})
    end)
  end

  test "should allow add_tag action on the resource when the user have the right ability" do
    Enum.each([:cluster, :host, :sap_system, :database], fn tag_resource ->
      user = %User{abilities: [%{resource: "#{tag_resource}_tags", name: "all"}]}

      assert Policy.authorize(:add_tag, user, %{tag_resource: tag_resource, resource: Tag})
    end)
  end

  test "should allow remove_tag action on the resource when the user have the right ability" do
    Enum.each([:cluster, :host, :sap_system, :database], fn tag_resource ->
      user = %User{abilities: [%{resource: "#{tag_resource}_tags", name: "all"}]}

      assert Policy.authorize(:remove_tag, user, %{tag_resource: tag_resource, resource: Tag})
    end)
  end
end
