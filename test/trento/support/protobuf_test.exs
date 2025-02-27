defmodule Trento.Support.Test do
  @moduledoc false
  use ExUnit.Case

  alias Trento.Support.Protobuf

  alias Google.Protobuf.{
    ListValue,
    Struct,
    Value
  }

  test "from_map" do
    assert %{
             "boolean" => %Value{kind: {:bool_value, true}},
             "integer" => %Value{kind: {:number_value, 10}},
             "list" => %Value{
               kind:
                 {:list_value,
                  %ListValue{
                    values: [
                      %Value{kind: {:string_value, "string"}},
                      %Value{kind: {:number_value, 15}}
                    ]
                  }}
             },
             "map" => %Value{
               kind:
                 {:struct_value,
                  %Struct{
                    fields: %{
                      "integer" => %Value{kind: {:number_value, 10}},
                      "list" => %Value{
                        kind:
                          {:list_value,
                           %ListValue{
                             values: [
                               %Value{kind: {:bool_value, true}},
                               %Value{kind: {:null_value, :NULL_VALUE}}
                             ]
                           }}
                      }
                    }
                  }}
             },
             "nil" => %Value{kind: {:null_value, :NULL_VALUE}},
             "some_atom" => %Value{kind: {:string_value, "some_value"}},
             "string" => %Value{kind: {:string_value, "some_string"}}
           } ==
             Protobuf.from_map(%{
               "string" => "some_string",
               :some_atom => :some_value,
               "integer" => 10,
               "boolean" => true,
               "nil" => nil,
               "list" => ["string", 15],
               "map" => %{
                 "list" => [true, nil],
                 "integer" => 10
               }
             })
  end
end
