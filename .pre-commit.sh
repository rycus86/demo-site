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

# run the tests
case $(arch) in
    arm*|aarch64) FROM="arm32v6/python:2.7-alpine3.6" ;;
    *)            FROM="python:2.7-alpine" ;;
esac

docker build -t demo-site-test-runner - << EOF > /dev/null
FROM ${FROM}
RUN pip install $(cat requirements.txt | paste -s -d ' ')
CMD PYTHONPATH=src python -m unittest discover -s tests -v
EOF
if [ "$?" -ne "0" ]; then
    exit 1
fi

docker run --rm -v ${PWD}:/app:ro -w /app demo-site-test-runner
if [ "$?" -ne "0" ]; then
    exit 1
fi

echo
