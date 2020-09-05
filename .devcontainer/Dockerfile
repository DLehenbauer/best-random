# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.134.1/containers/javascript-node/.devcontainer/base.Dockerfile
ARG VARIANT="14"
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends tmux

RUN cd /workspaces/best-random/tools/TestU01 \
    && make

RUN cd /workspaces/best-random/tools/PractRand \
    && make
