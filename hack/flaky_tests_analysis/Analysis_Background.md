# Flaky tests analysis

Implementation taken from [git repo](https://github.com/F-Secure/flaky-tests-detection)

Implementation is based on ["Modeling and ranking flaky tests at Apple"](https://dl.acm.org/doi/10.1145/3377813.3381370) by Kowalczyk, Emily & Nair, Karan & Gao, Zebao & Silberstein, Leo & Long, Teng & Memon, Atif.




## Features

* Prints out top test names and their latest calculation window scores (normal fliprate and exponentially weighted moving average fliprate that take previous calculation windows into account).
* Calculation grouping options:
  * `n` days.
  * `n` runs.
* Heatmap visualization of the scores and history.
  
## Parameters

### Data options (choose one)

* `--test-history-csv`
  * Give a path to a test history csv file which includes three fields: `timestamp`, `test_identifier` and `test_status`.
* `--junit-files`
  * Give a path to a folder with `JUnit` test results.
  
### Calculation options

* `--grouping-option`
  * `days` to use `n` days for fliprate calculation windows.
  * `runs` to use `n` runs for fliprate calculation windows.
  
* `--window-size`
  * Fliprate calculation window size `n`.
  
* `--window-count`
  * History size for exponentially weighted moving average calculations.
  
* `--top-n`
  * How many top highest scoring tests to print out.
### Heatmap generation
* `--heatmap`
  * Turn heatmap generation on.
  * Two pictures generated: normal fliprate and exponentially weighted moving average fliprate score.
  * Same parameters used as with the printed statistics.
  
### Full examples

* `JUnit` files with calculations per 5 runs. 15 runs history and 5 tests printed out.
  * `--junit-files=/tmp --grouping-option=runs --window-size=5 --window-count=3 --top-n=5`

