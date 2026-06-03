# `Trento.DataCase`
[🔗](https://github.com/trento-project/web/blob/main/test/support/data_case.ex#L4)

This module defines the setup for tests requiring
access to the application's data layer.

You may define functions here to be used as helpers in
your tests.

Finally, if the test case interacts with the database,
we enable the SQL sandbox, so changes done to the database
are reverted at the end of every test. If you are using
PostgreSQL, you can even run database tests asynchronously
by setting `use Trento.DataCase, async: true`, although
this option is not recommended for other databases.

# `errors_on`

A helper that transforms changeset errors into a map of messages.

    assert {:error, changeset} = Accounts.create_user(%{password: "short"})
    assert "password is too short" in errors_on(changeset).password
    assert %{password: ["password is too short"]} = errors_on(changeset)

---

*Consult [api-reference.md](api-reference.md) for complete listing*
