#!/bin/bash

echo
echo "Running pre-commit hooks"

# make sure there aren't any local services
grep -ri "localhost" src/ | grep -iE '\.(py|js|css):' > /dev/null
RESULT=$?

if [ "$RESULT" -eq "0" ]; then
    echo "There are references to 'localhost' in the code"
    grep -nri "localhost" src/ | grep -iE '\.(py|js|css):' | grep --color "localhost"
    exit 1
fi

# make sure debug=False for the Flask app
grep -i "debug=True" src/app.py > /dev/null
RESULT=$?

if [ "$RESULT" -eq "0" ]; then
    echo "The Flask app is set to debug mode"
    exit 1
fi

# make sure the Flask cache is in place
grep 'Cache(app,' src/app.py | grep -vE '^\s*#' > /dev/null
if [ "$?" -ne "0" ]; then
    echo "The Flask cache is not enabled"
    exit 1
fi

# run the tests
HAS_DOCKER=$(docker version > /dev/null 2>&1; echo $?)
if [ "$HAS_DOCKER" -eq "0" ]; then
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

else
    # try running the test locally with Python
    PYTHONPATH=src python -m unittest discover -s tests -v
    if [ "$?" -ne "0" ]; then
        exit 1
    fi
fi

echo
