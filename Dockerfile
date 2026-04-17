FROM ubuntu:24.04
MAINTAINER Piero Toffanin <pt@masseranolabs.com>

EXPOSE 3000

USER root

ENV NVM_DIR=/usr/local/nvm
ENV NODE_VERSION=14

RUN mkdir -p $NVM_DIR /var/www && \
    for i in $(seq 1 20); do \
        apt-get update && apt-get install -y curl gpg-agent && break; \
        echo "apt-get failed, retrying... ($i/20)"; \
        sleep 30; \
    done && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash && \
    . $NVM_DIR/nvm.sh && \
    nvm install $NODE_VERSION && \
    nvm alias default $NODE_VERSION && \
    ln -sf $(find $NVM_DIR -path "*/bin/node" | head -1) /usr/bin/node && \
    ln -sf $(find $NVM_DIR -path "*/bin/npm" | head -1) /usr/bin/npm && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR "/var/www"
COPY . /var/www

RUN npm install --production

ENTRYPOINT ["/usr/bin/node", "/var/www/index.js"]
