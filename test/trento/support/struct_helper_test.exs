defmodule Trento.Support.StructHelperTest do
  use ExUnit.Case

  alias Trento.Support.StructHelper

  describe "to_atomize_map/1" do
    test "should map plain keys to atom keys" do
      datetime = DateTime.utc_now()
      date = Date.utc_today()
      naive_datetime = NaiveDateTime.utc_now()

      initial_map = %{
        "id" => "some-id",
        "not_existing_atom" => "some-value",
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
               "not_existing_atom" => "some-value",
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
