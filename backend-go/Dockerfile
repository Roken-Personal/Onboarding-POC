# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod files (go.sum may not exist yet, that's OK)
COPY go.mod ./
COPY go.sum* ./

# Download dependencies and generate/update go.sum
RUN go mod tidy
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o onboarding-backend .

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/onboarding-backend .

# Expose port
EXPOSE 8080

# Run the binary
CMD ["./onboarding-backend"]

