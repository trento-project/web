# Parameters for gen-test-data-* targets
## Read/write JUNIT files from this path
PATH-TO-JUNIT-FILES ?= /tmp
N-TIMES ?= 10
# RUN_ONLY is the specific file or path to run tests from.
# Paths must be relative to repository root in case of mix tests. e.g. RUN_ONLY=./test/trento/hosts_test.exs
RUN_ONLY ?=
ifdef RUN_ONLY
RUN_ONLY_FE_OPTION= -- $(RUN_ONLY)
RUN_ONLY_E2E_OPTION=--spec $(RUN_ONLY)
else
RUN_ONLY_FE_OPTION=
RUN_ONLY_E2E_OPTION=
endif

# Parameters for analyze-files target
WINDOW-SIZE ?= 5
WINDOW-COUNT ?=100
TOP-N ?= 40
# Use only if extra customization is needed
WRITE_JUNIT ?= 1
CLI_LOG_PREFIX ?= Trento_Flaky_Test_Analysis_Log
LOG_FILENAME="$(CLI_LOG_PREFIX)_$(shell date +%F_%T).txt"
ENV_TS ?= "$(shell date +%F_%T)"

gen-test-data-be:
	cd ../../ ; touch $(LOG_FILENAME) ; for i in $$(seq 1 $(N-TIMES)) ;  do \
			echo "Run $$i of $(N-TIMES)" ;\
		  WRITE_JUNIT=$(WRITE_JUNIT) report_dir=./junit-reports mix test $(RUN_ONLY) | tee -a  $(LOG_FILENAME) ;\
		done 

gen-test-data-fe:
	cd ../../assets ;  export ENV_TS=$(ENV_TS) ; for i in $$(seq 1 $(N-TIMES)) ; do \
			echo "Run $$i of $(N-TIMES)" ;\
		  JEST_JUNIT_OUTPUT_FILE="$(PATH-TO-JUNIT-FILES)/junit_FE_$(ENV_TS)_$$i.xml" npm test $(RUN_ONLY_FE_OPTION) --reporters=jest-junit;\
		done 

gen-test-data-e2e:
	cd ../../test/e2e ; export ENV_TS=$(ENV_TS) ; for i in $$(seq 1 $(N-TIMES)) ; do \
			echo "Run $$i of $(N-TIMES)" ;\
			npx cypress run --reporter junit --reporter-options "mochaFile=$(PATH-TO-JUNIT-FILES)/trento-e2e-junit-[hash]-$(ENV_TS).xml" $(RUN_ONLY_E2E_OPTION);\
		done 

analyze-files:
	flaky --junit-files=$(PATH-TO-JUNIT-FILES) --grouping-option=runs --window-size=$(WINDOW-SIZE) --window-count=$(WINDOW-COUNT) --top-n=$(TOP-N)

venv-create:
	@python -m venv .venv --copies && \
	echo "Please run: source .venv/bin/activate"

install-deps:
	.venv/bin/pip install -r ./requirements.txt

