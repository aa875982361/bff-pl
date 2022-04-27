npx tsc
NAME=${1:-bff-pl};
BASE_SERVICE_NAME=$NAME-base-service
BFF_SERVICE_TEST_NAME=$NAME-test

npx pm2 describe $NAME > /dev/null
RUNNING=$?
if [ "${RUNNING}" -ne 0 ]; then
    echo "start app '$NAME'..."
    npx pm2 start ./dist/bffServiceRpc/index.js --name $NAME
else
    echo "restart app '$NAME'..."
    npx pm2 restart $NAME
fi;

npx pm2 describe $BASE_SERVICE_NAME > /dev/null
RUNNING=$?
if [ "${RUNNING}" -ne 0 ]; then
    echo "start app '$BASE_SERVICE_NAME'..."
    npx pm2 start ./dist/baseServiceRpc/index.js --name $BASE_SERVICE_NAME
else
    echo "restart app '$BASE_SERVICE_NAME'..."
    npx pm2 restart $BASE_SERVICE_NAME
fi;

npx pm2 describe $BFF_SERVICE_TEST_NAME > /dev/null
RUNNING=$?
if [ "${RUNNING}" -ne 0 ]; then
    echo "start app '$BFF_SERVICE_TEST_NAME'..."
    npx pm2 start ./dist/test/cliendSendReq.js --name $BFF_SERVICE_TEST_NAME
else
    echo "restart app '$BFF_SERVICE_TEST_NAME'..."
    npx pm2 restart $BFF_SERVICE_TEST_NAME
fi;