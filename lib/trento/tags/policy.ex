defmodule Trento.Tags.Policy do
  @moduledoc """
  Policy for the Tag resource

  User with the ability all:all can perform any operation on the tags.
  User with the ability all:<resource_type>_tags can perform any operations on the tags of the permitted resource.

  Resource type can be one of:
  - host
  - cluster
  - sap_system
  - database
  """
  @behaviour Bodyguard.Policy

  import Trento.Support.PolicyHelper
  alias Trento.Tags.Tag
  alias Trento.Users.User

  def authorize(action, %User{} = user, %{tag_resource: tag_resource, resource: Tag})
      when action in [:add_tag, :remove_tag],
      do: has_global_ability?(user) or has_all_ability_on_tag_resorce?(user, tag_resource)

  def authorize(_, _, _), do: false

  def has_all_ability_on_tag_resorce?(%User{} = user, tag_resource),
    do: user_has_ability?(user, %{name: "all", resource: "#{tag_resource}_tags"})
end
