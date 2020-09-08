FROM node:current-slim

# Install packages required for building
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        build-essential \
        ca-certificates \
        git \
        locales-all \
        python \
        tmux \
        unzip \
        wget

# Clean up
RUN apt-get autoremove -y && apt-get clean -y

WORKDIR /usr/src/best-random

# Download and build PractRand and TestU01
COPY tools/ ./tools/
RUN cd tools/PractRand && make
RUN cd tools/TestU01 && make

# Cache NPM modules by copying just 'package.json' and 'package-lock.json' performing the 'npm ci'.
COPY package*.json ./
RUN npm ci

# Copy remaining source
COPY ./*.json ./
COPY ./*.js ./
COPY ./tools/* ./tools/
COPY ./tools/Rng ./tools/Rng
COPY ./test ./test
COPY ./src ./src

RUN npm run build

# Prevent container for terminating
CMD ["sh", "-c", "sleep infinity"]
