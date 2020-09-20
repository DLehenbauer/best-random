FROM node:current-slim

# Install packages required for building
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        build-essential \
        ca-certificates \
        git \
        locales-all \
        procps \
        python \
        tmux \
        unzip \
        vim \
        wget

# Clean up
RUN apt-get autoremove -y && apt-get clean -y

WORKDIR /usr/src/best-random

# Install our custom .bashrc for colorized prompt and 'ls'
COPY ./.devcontainer/.bashrc /root

# Download and build PractRand and TestU01
COPY ./tools/PractRand ./tools/PractRand
RUN cd tools/PractRand && make fetchSrc base

COPY ./tools/TestU01 ./tools/TestU01
RUN cd tools/TestU01 && make fetchSrc base

# Cache NPM modules by copying just 'package.json' and 'package-lock.json' performing the 'npm ci'.
COPY package*.json ./
RUN npm ci

# Copy remaining source
COPY ./*.json ./
COPY ./*.js ./
COPY ./src ./src
COPY ./test ./test
COPY ./tools ./tools

RUN cd tools && chmod +x *.sh
RUN npm run build

# Prevent container for terminating
CMD ["sh", "-c", "sleep infinity"]
