# Variables
BINARY_NAME=links
SOURCE=main.go
BUILD_DIR=build
LDFLAGS=-ldflags="-s -w"

# Default target
.PHONY: all
all: build

# Build binary with optimizations
.PHONY: build
build:
	@echo "Building optimized binary..."
	@mkdir -p $(BUILD_DIR)
	go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME) $(SOURCE)
	@echo "Binary built: $(BUILD_DIR)/$(BINARY_NAME)"

# Build and compress with UPX
.PHONY: release
release: build $(BUILD_DIR)/$(BINARY_NAME).bak
	@echo "Compressing binary with UPX..."
	upx --best $(BUILD_DIR)/$(BINARY_NAME)
	@echo "Release binary ready: $(BUILD_DIR)/$(BINARY_NAME)"
	@echo "\n=== Build Complete ==="
	@echo "Uncompressed: $$(ls -lh $(BUILD_DIR)/$(BINARY_NAME).bak | awk '{print $$5}')"
	@echo "Compressed:   $$(ls -lh $(BUILD_DIR)/$(BINARY_NAME) | awk '{print $$5}')"

# Development build (no optimizations)
.PHONY: dev
dev:
	@echo "Building development binary..."
	@mkdir -p $(BUILD_DIR)
	go build -o $(BUILD_DIR)/$(BINARY_NAME)-dev $(SOURCE)
	@echo "Dev binary built: $(BUILD_DIR)/$(BINARY_NAME)-dev"

# Run the application
.PHONY: run
run: build
	@echo "Starting server..."
	./$(BUILD_DIR)/$(BINARY_NAME)

# Clean build artifacts
.PHONY: clean
clean:
	@echo "Cleaning build artifacts..."
	rm -rf $(BUILD_DIR)
	go clean

# Install dependencies
.PHONY: deps
deps:
	@echo "Installing dependencies..."
	go mod tidy
	go mod download

# Test the application
.PHONY: test
test:
	@echo "Running tests..."
	go test -v ./...

# Show binary sizes comparison
.PHONY: size
size: release
	@echo "\n=== Binary Size Comparison ==="
	@echo "Development (no optimizations):"
	@if [ -f $(BUILD_DIR)/$(BINARY_NAME)-dev ]; then ls -lh $(BUILD_DIR)/$(BINARY_NAME)-dev; fi
	@echo "Optimized (with -ldflags):"
	@if [ -f $(BUILD_DIR)/$(BINARY_NAME).bak ]; then ls -lh $(BUILD_DIR)/$(BINARY_NAME).bak; fi
	@echo "Release (optimized + UPX):"
	@ls -lh $(BUILD_DIR)/$(BINARY_NAME)

# Create backup before UPX compression
$(BUILD_DIR)/$(BINARY_NAME).bak: $(BUILD_DIR)/$(BINARY_NAME)
	@cp $(BUILD_DIR)/$(BINARY_NAME) $(BUILD_DIR)/$(BINARY_NAME).bak

# Help target
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  build    - Build optimized binary"
	@echo "  release  - Build and compress with UPX"
	@echo "  dev      - Build development binary (no optimizations)"
	@echo "  run      - Build and run the application"
	@echo "  clean    - Clean build artifacts"
	@echo "  deps     - Install/update dependencies"
	@echo "  test     - Run tests"
	@echo "  size     - Show binary size comparison"
	@echo "  help     - Show this help message"

