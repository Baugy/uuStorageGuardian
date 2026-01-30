#!/bin/bash

export JAVA_HOME=$PWD/java
echo "Running with Java version:"
./java/bin/java --version
sleep 1
./java/bin/java --add-opens=java.base/java.nio=ALL-UNNAMED -jar target/box-manager-core*.jar --spring.config.location=file:/etc/box-manager-core.yml
