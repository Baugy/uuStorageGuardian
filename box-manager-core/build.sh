#!/bin/bash

export JAVA_HOME=$PWD/java
export MAVEN_OPTS="--add-opens=java.base/java.nio=ALL-UNNAMED"
./mvnw clean install
