PATH-TO-JUNIT-FILES ?= /tmp
WINDOW-SIZE ?= 5
WINDOW-COUNT ?=100
TOP-N ?= 40
N-TIMES ?= 10
WRITE_JUNIT ?= 1
CLI_LOG_PREFIX ?= Trento_Flaky_Test_Analysis_Log
LOG_FILENAME="$(CLI_LOG_PREFIX)_$(shell date +%F_%T).txt"

gen-test-data:
	cd ../../ ; touch $(LOG_FILENAME) ;  for i in $$(seq 1 $(N-TIMES)) ; do \
			echo "Run $$i of $(N-TIMES)" ;\
		  WRITE_JUNIT=$(WRITE_JUNIT) mix test | tee -a  $(LOG_FILENAME) ;\
		done 

analyze-files:
	python check_flakes.py --junit-files=$(PATH-TO-JUNIT-FILES) --grouping-option=runs --window-size=$(WINDOW-SIZE) --window-count=$(WINDOW-COUNT) --top-n=$(TOP-N)

install-deps:
	pip install -r ./requirements.txt

alt-install-deps:
	nix-shell -p 'with pkgs.python311Packages; [junitparser pandas numpy matplotlib seaborn]'

