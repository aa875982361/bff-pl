tsc
NAME=${1:-bff-pl};
BASE_SERVICE_NAME=$NAME-base-service;

npx pm2 describe $NAME > /dev/null
RUNNING=$?
if [ "${RUNNING}" -ne 0 ]; then
    echo "not app '$NAME'..."
else
    echo "stop app '$NAME'..."
    npx pm2 stop $NAME
fi;

npx pm2 describe $BASE_SERVICE_NAME > /dev/null
RUNNING=$?
if [ "${RUNNING}" -ne 0 ]; then
    echo "not app '$BASE_SERVICE_NAME'..."
else
    echo "stop app '$BASE_SERVICE_NAME'..."
    npx pm2 stop $BASE_SERVICE_NAME
fi;