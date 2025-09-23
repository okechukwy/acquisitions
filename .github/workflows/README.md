# GitHub Actions Workflows

This directory contains CI/CD workflows for the Acquisitions API project.

## Workflows

### 1. Lint and Format Check (`lint-and-format.yml`)

- **Triggers**: Push/PR to `master` and `staging` branches
- **Purpose**: Ensures code quality and formatting consistency
- **Actions**:
  - Runs ESLint with `npm run lint`
  - Runs Prettier format check with `npm run format:check`
  - Provides clear error messages and fix suggestions
  - Generates workflow summary with results

### 2. Tests (`tests.yml`)

- **Triggers**: Push/PR to `master` and `staging` branches
- **Purpose**: Runs test suite and generates coverage reports
- **Actions**:
  - Runs tests with `npm test`
  - Sets required environment variables (`NODE_ENV=test`, `NODE_OPTIONS=--experimental-vm-modules`)
  - Uploads coverage reports as artifacts (30-day retention)
  - Generates detailed test summary

### 3. Docker Build and Push (`docker-build-and-push.yml`)

- **Triggers**: Push to `master` branch or manual dispatch
- **Purpose**: Builds and pushes production Docker images
- **Actions**:
  - Multi-platform builds (`linux/amd64`, `linux/arm64`)
  - Automatic tagging with branch, commit SHA, `latest`, and timestamp
  - Pushes to Docker Hub
  - Uses GitHub Actions cache for efficiency

## Required Secrets

For the Docker workflow to work, you need to set up these repository secrets:

1. `DOCKER_USERNAME` - Your Docker Hub username
2. `DOCKER_PASSWORD` - Your Docker Hub password or access token

## Setup Instructions

1. **Enable GitHub Actions**: Go to your repository Settings → Actions → General
2. **Add Secrets**: Go to Settings → Secrets and variables → Actions
3. **Configure Branch Protection**: Set up branch protection rules to require these checks

## Workflow Features

- ✅ **Caching**: npm dependencies are cached for faster builds
- ✅ **Multi-platform**: Docker images support multiple architectures
- ✅ **Artifacts**: Test coverage reports are preserved
- ✅ **Summaries**: Rich GitHub step summaries with results and troubleshooting
- ✅ **Error Handling**: Clear error messages and fix suggestions
- ✅ **Security**: Uses secrets for Docker Hub authentication
