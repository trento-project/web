defmodule Trento.ActivityLog.MetadataQueryParser do
  @moduledoc false
  require Pegasus

  @opts [tag: true]
  Pegasus.parser_from_string(
    """
    search_expr <- op_expr (boolean_connector op_expr)*
    boolean_connector <- (and_ / or_ / default_)
    and_ <- ' '+ 'AND' ' '+
    or_ <-  ' '+ 'OR' ' '+
    default_ <- ' '+
    op_expr <-  numeric_op numeric  / leading_star? alnum trailing_star?
    leading_star <- '*'
    trailing_star <- '*'
    alnum <- [a-zA-Z0-9-_]+
    numeric <- [0-9]+
    numeric_op <- ('==' / '>' / '<' / '!=')
    """,
    search_expr: [parser: true],
    boolean_connector: @opts,
    and_: @opts,
    or_: @opts,
    default_: @opts,
    op_expr: @opts,
    leading_star: @opts,
    trailing_star: @opts,
    alnum: @opts,
    numeric: @opts,
    numeric_op: @opts
  )

  @search_regex "[a-zA-Z0-9_-]"
  @default_connector "||"
  def parse(search_string, capture_var \\ "@.**")

  def parse(search_string, capture_var) when is_binary(search_string) do
    search_string_trimmed = String.trim(search_string)

    case search_string_trimmed != "" && search_expr(search_string_trimmed) do
      {:ok, parsed_object, "" = _unconsumed_input, _, _, _} ->
        add_surrounding_parens? = length(parsed_object) > 1

        query_fragment =
          Enum.map_join(parsed_object, " ", fn
            {:boolean_connector, [and_: _]} ->
              "&&"

            {:boolean_connector, [or_: _]} ->
              "||"

            {:boolean_connector, [default_: _]} ->
              @default_connector

            {:op_expr, [alnum: alnum]} ->
              "(#{capture_var} == \"#{alnum}\")"

            {:op_expr, [leading_star: _, alnum: alnum]} ->
              "(#{capture_var} like_regex \"^#{@search_regex}*#{alnum}$\")"

            {:op_expr, [leading_star: _, alnum: alnum, trailing_star: _]} ->
              "(#{capture_var} like_regex \"^#{@search_regex}*#{alnum}#{@search_regex}*$\")"

            {:op_expr, [alnum: alnum, trailing_star: _]} ->
              "(#{capture_var} starts with \"#{alnum}\")"

            {:op_expr, [numeric_op: [op], numeric: numeric]} ->
              "(#{capture_var} #{op} #{numeric})"
          end)

        case add_surrounding_parens? do
          true ->
            {:ok, "(#{query_fragment})"}

          false ->
            {:ok, query_fragment}
        end

      false ->
        {:error, :noop, search_string_trimmed}

      error ->
        {:error, error, search_string_trimmed}
    end
  end

  def parse(maybe_search_input, _), do: {:error, :noop, maybe_search_input}
end
