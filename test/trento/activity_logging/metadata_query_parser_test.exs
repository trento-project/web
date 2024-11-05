defmodule Trento.ActivityLog.MetadataQueryParserTest do
  @moduledoc false

  use ExUnit.Case

  alias Trento.ActivityLog.MetadataQueryParser

  @parse_succeed_cases [
    "foo",
    "  foo",
    "foo  ",
    "  foo  ",
    "foo42",
    "foo_bar",
    "foo-bar",
    "foo-bar_baz42",
    "*foo-bar_baz42*",
    "*foo*",
    "*foo",
    "foo*",
    "foo bar",
    "foo AND bar",
    "foo OR bar",
    "foo AND bar AND baz",
    "foo AND bar OR baz",
    "foo OR bar AND baz",
    "foo bar OR baz",
    "foo OR bar baz",
    "foo bar baz",
    "==20",
    ">20",
    "<20",
    "!=20",
    ">3 AND <5",
    "!=5 AND !=20",
    "==5 OR ==20",
    "<3 OR >5",
    "<3 >5 !=42"
  ]
  @parse_fail_cases [
    "",
    "    ",
    "foo;;",
    "foo$",
    "foo;; SELECT 1;;",
    ">42;;SELECT 1;;"
  ]
  describe "Metadata query parsing into Jsonpath expressions" do
    test "Should parse successfully." do
      for test_case <- @parse_succeed_cases do
        assert {:ok, parsed_string} = MetadataQueryParser.parse(test_case)

        assert is_binary(parsed_string)
      end
    end

    test "Should not parse successfully" do
      for test_case <- @parse_fail_cases do
        assert {:error, _reason, _trimmed_search_string} = MetadataQueryParser.parse(test_case)
      end
    end
  end
end
