FROM ubuntu:20.04

RUN apt-get update && apt-get install -y \
  adb \
  curl \
  && rm -rf /var/lib/apt/lists/*

ENV NVM_DIR /opt/nvm
RUN mkdir -p $NVM_DIR
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash

RUN ln -s $NVM_DIR/nvm.sh /etc/profile.d/50-nvm.sh

ENV NODE_VERSION 14
RUN bash -c ". $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm use $NODE_VERSION \
    && nvm alias default $NODE_VERSION"

RUN bash -c ". $NVM_DIR/nvm.sh \
    && npm install --global http-server"
