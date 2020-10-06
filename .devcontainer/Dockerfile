# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.134.1/containers/javascript-node/.devcontainer/base.Dockerfile
ARG VARIANT="14"
ARG USERNAME="node"
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends tmux

# Install Docker CLI / Docker-Compose and create 'docker-init.sh' to proxy docker socket.
# (We retrieve the install script from the 'docker-from-docker' dev container template)
RUN mkdir /tmp/library-scripts \
    && curl -o /tmp/library-scripts/docker-debian.sh -sS https://raw.githubusercontent.com/microsoft/vscode-dev-containers/c3214ad7fcf5086e898e3941a36e0171959a48ca/containers/azure-ansible/.devcontainer/library-scripts/docker-debian.sh \
    && /bin/bash /tmp/library-scripts/docker-debian.sh "${ENABLE_NONROOT_DOCKER}" "${SOURCE_SOCKET}" "${TARGET_SOCKET}" "${USERNAME}" \
    && rm -rf /tmp/library-scripts/

# Clean up apt artifacts
RUN apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Install our custom .bashrc for colorized prompt and 'ls'
COPY ./.bashrc /root
