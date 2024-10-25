defmodule Trento.Support.MapHelperTest do
  use ExUnit.Case

  alias Trento.Support.MapHelper

  test "atomize_keys/1 transforms an input to a map with atom keys" do
    scenarios = [
      %{
        input: %{"a" => "foo", "b" => 2},
        expected: %{a: "foo", b: 2}
      },
      %{
        input: %{"a" => "foo", "b" => %{"c" => "bar"}},
        expected: %{a: "foo", b: %{c: "bar"}}
      },
      %{
        input: %{"a" => "foo", "b" => [%{"c" => "bar"}, %{"d" => "baz"}]},
        expected: %{a: "foo", b: [%{c: "bar"}, %{d: "baz"}]}
      },
      %{
        input: [%{"a" => "foo", "b" => 2}, %{"c" => "bar", "d" => 3}],
        expected: [%{a: "foo", b: 2}, %{c: "bar", d: 3}]
      }
    ]

    for %{input: input, expected: expected} <- scenarios do
      assert MapHelper.atomize_keys(input) == expected
    end
  end

  test "atomize_keys/1 passes through non maps" do
    scenarios = [
      %{input: nil, expected: nil},
      %{
        input: "foo",
        expected: "foo"
      },
      %{
        input: 42,
        expected: 42
      },
      %{
        input: ["foo", "bar"],
        expected: ["foo", "bar"]
      }
    ]

    for %{input: input, expected: expected} <- scenarios do
      assert MapHelper.atomize_keys(input) == expected
    end
  end
end
