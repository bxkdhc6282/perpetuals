# Build the image
docker build -f .devcontainer/Dockerfile -t perpetuals-dev .

# Run the container with your project mounted
docker run -it --rm -v $(pwd):/workdir perpetuals-dev

#Build with no idl
anchor build --no-idl