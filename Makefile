# Makefile for PBCC Flutter App
# Abstracting 'fvm flutter' and 'fvm dart' commands

FLUTTER = fvm flutter
DART = fvm dart

.PHONY: all help get clean upgrade format analyze fix test run build icons splash

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

all: get format analyze test ## Run get, format, analyze, and test

get: ## Get dependencies
	$(FLUTTER) pub get

clean: ## Clean the project
	$(FLUTTER) clean

upgrade: ## Upgrade dependencies
	$(FLUTTER) pub upgrade

format: ## Format the code
	$(DART) format .

analyze: ## Analyze the code
	$(FLUTTER) analyze

fix: ## Fix lint issues automatically
	$(DART) fix --apply

test: ## Run unit tests
	$(FLUTTER) test

run: ## Run the app
	$(FLUTTER) run

build-apk: ## Build Android APK
	$(FLUTTER) build apk --split-per-abi

build-ios: ## Build iOS app
	$(FLUTTER) build ios --no-codesign

icons: ## Generate launcher icons
	$(DART) run flutter_launcher_icons

splash: ## Generate native splash screen
	$(DART) run flutter_native_splash:create

dev-setup: ## Initial setup for developers
	$(FLUTTER) --version
	$(FLUTTER) pub get
	$(DART) run flutter_launcher_icons
	$(DART) run flutter_native_splash:create
