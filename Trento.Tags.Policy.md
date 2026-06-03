# `Trento.Tags.Policy`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/tags/policy.ex#L4)

Policy for the Tag resource

User with the ability all:all can perform any operation on the tags.
User with the ability all:<resource_type>_tags can perform any operations on the tags of the permitted resource.

Resource type can be one of:
- host
- cluster
- sap_system
- database

# `authorize`

# `has_all_ability_on_tag_resorce?`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
