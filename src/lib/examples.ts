export const compose = `services:
  dockrouter:
    image: dockrouter/dockrouter:latest
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - dockrouter-data:/data
    environment:
      DR_ACME_EMAIL: you@example.com
  web:
    image: nginx:alpine
    labels:
      dr.enable: "true"
      dr.host: "app.example.com"
      dr.tls: "auto"
volumes:
  dockrouter-data:`;
export const dockerRun = `docker run -d --name dockrouter \\
  --restart unless-stopped \\
  -p 80:80 -p 443:443 \\
  -v /var/run/docker.sock:/var/run/docker.sock:ro \\
  -v dockrouter-data:/data \\
  -e DR_ACME_EMAIL=you@example.com \\
  dockrouter/dockrouter:latest`;
export const binary = `git clone https://github.com/DockRouter/dockrouter.git
cd dockrouter
go build -o dockrouter ./cmd/dockrouter
./dockrouter --acme-email=you@example.com`;
