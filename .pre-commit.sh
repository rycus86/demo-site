#!/bin/bash

echo
echo "Running pre-commit hooks"

# make sure there aren't any local services
grep -ri "localhost" src/ > /dev/null
RESULT=$?

if [ "$RESULT" -eq "0" ]; then
    echo "There are references to 'localhost' in the code"
    exit 1
fi

# make sure debug=False for the Flask app
grep "debug=True" src/app.py > /dev/null
RESULT=$?

if [ "$RESULT" -eq "0" ]; then
    echo "The Flask app is set to debug mode"
    exit 1
fi

# run tests if Flask is installed
HAS_FLASK=$(python -c 'import flask' >/dev/null 2>&1; echo $?)
if [ "$HAS_FLASK" -eq "0" ]; then
    PYTHONPATH=src python -m unittest discover -s tests/ -v
else
    echo "Skipping tests"
fi

echo