
# Reusable Makefile
# ------------------------------------------------------------------------
# This section of the Makefile should not be modified, it includes
# commands from my reusable Makefile: https://github.com/rowanmanning/make
include node_modules/@rowanmanning/make/javascript/index.mk
# [edit below this line]
# ------------------------------------------------------------------------


# Meta tasks
# ----------

.PHONY: docs


# Documentation tasks
# -------------------

# Regenerate documentation
docs:
	@rm -rf docs
	@jsdoc --configure .jsdoc.json
	@$(TASK_DONE)
