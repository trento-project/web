PATH-TO-JUNIT-FILES ?= /tmp

# Parameters for analyze-files target
WINDOW-SIZE ?= 5
WINDOW-COUNT ?=100
TOP-N ?= 40

analyze-files:
	flaky --junit-files=$(PATH-TO-JUNIT-FILES) --grouping-option=runs --window-size=$(WINDOW-SIZE) --window-count=$(WINDOW-COUNT) --top-n=$(TOP-N)

venv-create:
	@python -m venv .venv --copies && \
	echo "Please run: source .venv/bin/activate"

install-deps:
	.venv/bin/pip install -r ./requirements.txt
