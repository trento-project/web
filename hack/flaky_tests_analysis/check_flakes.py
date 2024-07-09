# Taken from: https://github.com/F-Secure/flaky-tests-detection
import argparse
import logging
from decimal import getcontext, Decimal, ROUND_UP
from pathlib import Path
from typing import Dict, Set

from junitparser import JUnitXml, TestSuite
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

EWM_ALPHA = 0.1
EWM_ADJUST = False
HEATMAP_FIGSIZE = (100, 50)


def parse_input_files(junit_files: str, test_history_csv: str):
    if junit_files:
        df = parse_junit_to_df(Path(junit_files))
    else:
        df = pd.read_csv(
            test_history_csv,
            index_col="timestamp",
            parse_dates=["timestamp"],
        )
    return df.sort_index()


def calc_fliprate(testruns: pd.Series) -> float:
    """Calculate test result fliprate from given test results series"""
    if len(testruns) < 2:
        return 0.0
    first = True
    previous = None
    flips = 0
    possible_flips = len(testruns) - 1
    for _, val in testruns.items():
        if first:
            first = False
            previous = val
            continue
        if val != previous:
            flips += 1
        previous = val
    return flips / possible_flips


def non_overlapping_window_fliprate(testruns: pd.Series, window_size: int, window_count: int) -> pd.Series:
    """Reverse given testruns to latest first and calculate flip rate for non-overlapping run windows"""
    testruns_reversed = testruns.iloc[::-1]
    fliprate_groups = (
        testruns_reversed.groupby(np.arange(len(testruns_reversed)) // window_size)
        .apply(calc_fliprate)
        .iloc[:window_count]
    )
    return fliprate_groups.rename(lambda x: window_count - x).sort_index()


def calculate_n_days_fliprate_table(testrun_table: pd.DataFrame, days: int, window_count: int) -> pd.DataFrame:
    """Select given history amount and calculate fliprates for given n day windows.

    Return a table containing the results.
    """
    data = testrun_table[testrun_table.index >= (testrun_table.index.max() - pd.Timedelta(days=days * window_count))]

    fliprates = data.groupby([pd.Grouper(freq=f"{days}D"), "test_identifier"])["test_status"].apply(calc_fliprate)

    fliprate_table = fliprates.rename("flip_rate").reset_index()
    fliprate_table["flip_rate_ewm"] = (
        fliprate_table.groupby("test_identifier")["flip_rate"]
        .ewm(alpha=EWM_ALPHA, adjust=EWM_ADJUST)
        .mean()
        .droplevel("test_identifier")
    )

    return fliprate_table[fliprate_table.flip_rate != 0]


def calculate_n_runs_fliprate_table(testrun_table: pd.DataFrame, window_size: int, window_count: int) -> pd.DataFrame:
    """Calculate fliprates for given n run window and select m of those windows
    Return a table containing the results.
    """
    fliprates = testrun_table.groupby("test_identifier")["test_status"].apply(
        lambda x: non_overlapping_window_fliprate(x, window_size, window_count)
    )

    fliprate_table = fliprates.rename("flip_rate").reset_index()
    fliprate_table["flip_rate_ewm"] = (
        fliprate_table.groupby("test_identifier")["flip_rate"]
        .ewm(alpha=EWM_ALPHA, adjust=EWM_ADJUST)
        .mean()
        .droplevel("test_identifier")
    )
    fliprate_table = fliprate_table.rename(columns={"level_1": "window"})

    return fliprate_table[fliprate_table.flip_rate != 0]


def get_top_fliprates(fliprate_table: pd.DataFrame, top_n: int, precision: int) -> Dict[str, Decimal]:
    """return the top n highest scoring test identifiers and their scores

    Look at the last calculation window for each test from the fliprate table
    and return the top n highest scoring test identifiers and their scores
    """
    context = getcontext()
    context.prec = precision
    context.rounding = ROUND_UP
    last_window_values = fliprate_table.groupby("test_identifier").last()

    top_fliprates_ewm = last_window_values.nlargest(top_n, "flip_rate_ewm")[["flip_rate_ewm"]].reset_index()
    #  Context precision and rounding only come into play during arithmetic operations. Therefore * 1
    return {testname: Decimal(score) * 1 for testname, score in top_fliprates_ewm.to_records(index=False)}


def get_image_tables_from_fliprate_table(
    fliprate_table: pd.DataFrame,
    top_identifiers_ewm: Set[str],
) -> pd.DataFrame:
    """Construct tables for heatmap generation from the fliprate table.

    Rows contain the test identifier and columns contain the window as timestamp for
    daily grouping or integer for grouping with runs.
    """
    pivot_columns = "timestamp" if "timestamp" in fliprate_table.columns else "window"
    image_ewm = fliprate_table.pivot(index="test_identifier", columns=pivot_columns, values="flip_rate_ewm")
    return image_ewm[image_ewm.index.isin(top_identifiers_ewm)]


def generate_image(image: pd.DataFrame, title: str, filename: str) -> None:
    """Save a seaborn heatmap with given data"""
    plt.figure(figsize=HEATMAP_FIGSIZE)
    plt.title(title, fontsize=50)
    sns.heatmap(data=image, linecolor="black", linewidths=0.1, annot=True).set_facecolor("black")
    plt.savefig(filename, bbox_inches="tight")
    plt.close()


def parse_junit_suite_to_df(suite: TestSuite) -> list:
    """Parses Junit TestSuite results to a test history dataframe"""
    dataframe_entries = []
    time = suite.timestamp

    for testcase in suite:
        test_identifier = testcase.classname + "::" + testcase.name

        # junitparser has "failure", "skipped" or "error" in result list if any
        if not testcase.result:
            test_status = "pass"
        else:
            test_status = testcase.result[0]._tag
            if test_status == "skipped":
                continue

        dataframe_entries.append(
            {
                "timestamp": time,
                "test_identifier": test_identifier,
                "test_status": test_status,
            }
        )
    return dataframe_entries


def parse_junit_to_df(folderpath: Path) -> pd.DataFrame:
    """Read JUnit test result files to a test history dataframe"""
    dataframe_entries = []

    for filepath in folderpath.glob("*.xml"):
        xml = JUnitXml.fromfile(filepath)
        if isinstance(xml, JUnitXml):
            for suite in xml:
                dataframe_entries += parse_junit_suite_to_df(suite)
        elif isinstance(xml, TestSuite):
            dataframe_entries += parse_junit_suite_to_df(xml)
        else:
            raise TypeError(f"not known suite type in {filepath}")

    if dataframe_entries:
        df = pd.DataFrame(dataframe_entries)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.set_index("timestamp")
        return df
    else:
        raise RuntimeError(f"No Junit files found from path {folderpath}")


def create_heat_map(
    heatmap: bool,
    fliprate_table: pd.DataFrame,
    top_flip_rates: Dict[str, Decimal],
    grouping_option: str,
    top_n: int,
    window_size: int,
    window_count: int,
):
    if not heatmap:
        return

    logging.info("\n\nGenerating heatmap images...")
    top_identifiers_ewm = set(top_flip_rates.keys())

    table_data = get_image_tables_from_fliprate_table(fliprate_table, top_identifiers_ewm)

    if grouping_option == "days":
        title_ewm = (
            f"Top {top_n} of tests with highest latest window exponentially weighted moving average fliprate score "
            f"- alpha (smoothing factor) = {EWM_ALPHA} - last {window_size * window_count} days of data"
        )
        filename_ewm = f"{window_size}day_flip_rate_ewm_top{top_n}.png"
    else:
        title_ewm = (
            f"Top {top_n} of tests with highest latest window exponentially weighted moving average fliprate score - "
            f"alpha (smoothing factor) = {EWM_ALPHA} - {window_size} last runs fliprate and "
            f"{window_size * window_count} last runs data"
        )
        filename_ewm = f"{window_size}runs_flip_rate_ewm_top{top_n}.png"

    generate_image(table_data, title_ewm, filename_ewm)
    logging.info(f"generated {filename_ewm}")


def main():
    """Print out top flaky tests and their fliprate scores.
    Also generate seaborn heatmaps visualizing the results if wanted.
    """

    logging.basicConfig(format="%(message)s", level=logging.INFO)

    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--junit-files", help="Path for a folder with JUnit xml test history files", type=str)
    group.add_argument("--test-history-csv", help="Path for precomputed test history csv", type=str)
    parser.add_argument(
        "--grouping-option",
        choices=["days", "runs"],
        help="flip rate calculation method - days or runs",
        required=True,
    )
    parser.add_argument(
        "--window-size",
        type=int,
        help="flip rate calculation window size",
        required=True,
    )
    parser.add_argument(
        "--window-count",
        type=int,
        help="flip rate calculation window count (history size)",
        required=True,
    )
    parser.add_argument(
        "--top-n",
        type=int,
        help="amount of unique tests and scores to print out",
        required=True,
    )
    parser.add_argument(
        "--precision, -p",
        type=int,
        help="Precision of the flip rate score, default is 4",
        default=4,
        dest="decimal_count",
    )
    parser.add_argument("--heatmap", action="store_true", default=False)
    args = parser.parse_args()
    precision = args.decimal_count

    df = parse_input_files(args.junit_files, args.test_history_csv)

    if args.grouping_option == "days":
        fliprate_table = calculate_n_days_fliprate_table(df, args.window_size, args.window_count)
    else:
        fliprate_table = calculate_n_runs_fliprate_table(df, args.window_size, args.window_count)

    top_flip_rates = get_top_fliprates(fliprate_table, args.top_n, precision)

    if not top_flip_rates:
        logging.info("No flaky tests.")
        return
    top_n = args.top_n
    logging.info(
        f"\nTop {top_n} flaky tests based on latest window exponential weighted moving average fliprate score",
    )
    for test_name, score in top_flip_rates.items():
        logging.info(f"{test_name} --- score: {score}")

    create_heat_map(
        args.heatmap, fliprate_table, top_flip_rates, args.grouping_option, top_n, args.window_size, args.window_count
    )


if __name__ == "__main__":
    main()
