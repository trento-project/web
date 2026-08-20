# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Support.StructHelperTest do
  use ExUnit.Case

  alias Trento.Support.StructHelper

  describe "to_atomize_map/1" do
    test "should map plain keys to atom keys" do
      datetime = DateTime.utc_now()
      date = Date.utc_today()
      naive_datetime = NaiveDateTime.utc_now()

      # We need to make the atom unique for testing purposes since
      # there has been a case where the pre-existing atom was acquired
      # /allocated by a newly added dependency thereby causing this test
      # to fail.
      ref = make_ref()
      some_unique_atom = "not_existing_atom_#{:erlang.term_to_binary(ref)}"

      initial_map = %{
        "id" => "some-id",
        some_unique_atom => "some-value",
        "not_loaded" => %Ecto.Association.NotLoaded{},
        __meta__: nil,
        __struct__: nil,
        list: [
          datetime,
          date,
          naive_datetime
        ]
      }

      assert %{
               some_unique_atom => "some-value",
               id: "some-id",
               list: [
                 datetime,
                 date,
                 naive_datetime
               ]
             } == StructHelper.to_atomized_map(initial_map)
    end
  end
end
