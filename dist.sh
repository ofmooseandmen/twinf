rm -rf app/build
cp -rp app build
pushd build/app
cp -p ../src/*.js .
popd
