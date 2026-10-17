import { binary, compose, dockerRun } from "./examples";
export type DocSection = {
  id: string;
  title: string;
  text: string;
  code?: string;
  note?: string;
  table?: string[][];
};
export type Doc = {
  slug: string;
  title: string;
  category: string;
  description: string;
  sections: DocSection[];
};
export const docs: Doc[] = [
  {
    slug: "getting-started",
    title: "Meet DockRouter",
    category: "Start here",
    description: "Your containers. A hostname. A clear path to HTTPS.",
    sections: [
      {
        id: "overview",
        title: "A small router with a Docker point of view",
        text: "DockRouter is a self-hosted ingress router. It watches the Docker socket, discovers enabled containers and forwards incoming HTTP and HTTPS traffic to them. Routing settings live in Docker labels; global settings live in environment variables or command-line flags.",
      },
      {
        id: "requirements",
        title: "Before you start",
        text: "Use a Docker host reachable from the internet, a domain you control and DNS records pointing to that host. Automatic TLS needs public access to ports 80 and 443. Keep DockRouter and your services on a shared Docker network. Persist /data so certificate state survives restarts.",
        note: "Docker socket access is privileged. Only run trusted router images, and keep the administration interface private. A read-only socket mount does not make the Docker API read-only.",
      },
      {
        id: "compose",
        title: "Your first Docker Compose deployment",
        text: "Save this as compose.yml. Replace app.example.com and you@example.com with your domain and email, then run docker compose up -d. The two services share Compose’s default network.",
        code: compose,
      },
      {
        id: "verify",
        title: "Follow the first request",
        text: "Wait for DNS to resolve and for certificate issuance, then open your hostname over HTTPS. Inspect container logs if a certificate is still pending. Your application does not need to handle TLS itself.",
        code: "docker compose up -d\ndocker compose logs -f dockrouter\n# On your workstation:\ncurl -I https://app.example.com",
      },
      {
        id: "next",
        title: "Make the route yours",
        text: "Add path matching, a port override or a load-balancing policy through labels. Use the TLS, security and observability guides to configure the edge for your own infrastructure.",
      },
    ],
  },
  {
    slug: "installation",
    title: "Installation",
    category: "Start here",
    description: "Run a Docker container or build one native Go binary.",
    sections: [
      {
        id: "docker",
        title: "Run with Docker",
        text: "Publish the ingress ports, mount the Docker socket and retain the data volume. Attach the router to the same Docker network as your application containers.",
        code: dockerRun,
        note: "This example keeps the admin listener private. If you publish port 9090, deliberately configure DR_ADMIN_BIND and admin credentials first.",
      },
      {
        id: "source",
        title: "Build from source",
        text: "The upstream project documents Go 1.22 or later. The router uses the Go standard library without third-party Go packages.",
        code: binary,
      },
      {
        id: "releases",
        title: "Prebuilt releases",
        text: "Release v1.2.0 provides Linux and macOS tar.gz archives and Windows zip archives for amd64 and arm64. Match the file to your host and verify it against checksums.txt from the same release. Docker deployments require a reachable Docker daemon, including when using a native binary.",
      },
      {
        id: "state",
        title: "Keep certificate state",
        text: "The default data directory is /data. Mount it on persistent storage so account and certificate data remain available across container replacements. Use DR_DATA_DIR to choose another location.",
      },
    ],
  },
  {
    slug: "routing",
    title: "Labels & discovery",
    category: "Routing",
    description: "Keep routing close to the application it belongs to.",
    sections: [
      {
        id: "required",
        title: "Two labels to discover a route",
        text: "Set dr.enable to true and provide dr.host. By default, DockRouter detects the backend port. Set dr.port explicitly when the container exposes multiple ports or you want a different target.",
        code: 'labels:\n  dr.enable: "true"\n  dr.host: "api.example.com"\n  dr.port: "8080"\n  dr.tls: "auto"',
      },
      {
        id: "paths",
        title: "Route by hostname and path",
        text: "Use dr.path for a path prefix and dr.priority to resolve route precedence. Higher priorities win. The prefix can be stripped or added through middleware labels.",
        code: 'labels:\n  dr.enable: "true"\n  dr.host: "example.com"\n  dr.path: "/api"\n  dr.priority: "10"\n  dr.stripprefix: "/api"',
      },
      {
        id: "lifecycle",
        title: "Routes follow container lifecycle",
        text: "Docker discovery updates the router when containers start or stop. Enabled replicas are collected in backend pools. Your router and target containers need network connectivity; labels do not create Docker networks.",
      },
      {
        id: "reference",
        title: "Routing label reference",
        text: "Optional routing labels let you override the defaults on each service.",
        table: [
          ["Label", "Purpose", "Default"],
          ["dr.enable", "Discover this container", "Required"],
          ["dr.host", "Incoming hostname", "Required"],
          ["dr.port", "Backend port", "Auto-detected"],
          ["dr.path", "Path prefix", "/"],
          ["dr.priority", "Route precedence", "0"],
          ["dr.address", "Explicit backend address", "Auto"],
          ["dr.loadbalancer", "Backend selection policy", "roundrobin"],
          ["dr.weight", "Weighted backend preference", "1"],
        ],
      },
    ],
  },
  {
    slug: "tls",
    title: "Automatic TLS",
    category: "Routing",
    description:
      "A secure first connection, with a little less certificate administration.",
    sections: [
      {
        id: "acme",
        title: "Let’s Encrypt with HTTP-01",
        text: "Configure DR_ACME_EMAIL, point DNS at the server, and allow incoming HTTP on port 80 and HTTPS on port 443. Add dr.tls: auto on the service. DockRouter handles the ACME challenge and certificate lifecycle.",
        code: 'environment:\n  DR_ACME_EMAIL: you@example.com\n# Application service labels:\nlabels:\n  dr.enable: "true"\n  dr.host: "app.example.com"\n  dr.tls: "auto"',
        note: "HTTP-01 does not issue wildcard certificates. Every requested hostname must resolve correctly and be reachable for validation.",
      },
      {
        id: "domains",
        title: "Additional names",
        text: "Use dr.tls.domains for additional SAN hostnames. All requested names must satisfy the certificate provider’s validation requirements.",
        code: 'dr.tls.domains: "example.com,www.example.com"',
      },
      {
        id: "manual",
        title: "Bring a certificate",
        text: "Set dr.tls to manual and provide both certificate and key paths as seen inside the router container. Mount those files into DockRouter. Manual TLS does not require an ACME email.",
        code: 'dr.tls: "manual"\ndr.tls.cert: "/certs/app/cert.pem"\ndr.tls.key: "/certs/app/key.pem"',
      },
      {
        id: "staging",
        title: "Test issuance before production",
        text: "Use DR_ACME_STAGING=true while testing your deployment to avoid production issuance rate limits. Staging certificates are not publicly trusted. Restore the production provider setting when the deployment is ready.",
      },
    ],
  },
  {
    slug: "load-balancing",
    title: "Load balancing",
    category: "Routing",
    description: "Choose the right path through your replicas.",
    sections: [
      {
        id: "strategies",
        title: "Four ways to share the load",
        text: "Choose a strategy per route with dr.loadbalancer. The default is roundrobin.",
        table: [
          ["Value", "Behavior"],
          ["roundrobin", "Rotate requests through the available pool"],
          ["weighted", "Prefer backends according to dr.weight"],
          ["iphash", "Use a stable client IP based selection"],
          ["leastconn", "Prefer the backend with fewer active connections"],
        ],
      },
      {
        id: "replicas",
        title: "Label services, scale replicas",
        text: "Containers with the same route feed the backend pool. Keep consistent host and path labels across replicas, and make every replica reachable from the router.",
        code: 'labels:\n  dr.enable: "true"\n  dr.host: "api.example.com"\n  dr.loadbalancer: "leastconn"\n  dr.healthcheck.path: "/health"',
      },
      {
        id: "health",
        title: "Let health checks guide selection",
        text: "Active health checks take failing backends out of rotation and return recovered instances after consecutive successful probes. The last healthy backend is not ejected by this policy. Configure your health endpoint and thresholds explicitly.",
        code: 'dr.healthcheck.path: "/health"\ndr.healthcheck.interval: "10s"\ndr.healthcheck.timeout: "5s"\ndr.healthcheck.threshold: "3"\ndr.healthcheck.recovery: "2"',
      },
      {
        id: "failures",
        title: "Plan failure behavior",
        text: "The dr.retry label sets the retry count, while dr.circuitbreaker configures a failure threshold and window. Consider how retrying affects your application’s non-idempotent operations before enabling retries.",
        code: 'dr.retry: "2"\ndr.circuitbreaker: "5/30s"',
      },
    ],
  },
  {
    slug: "security",
    title: "Security at the edge",
    category: "Operate",
    description:
      "Explicit access decisions. Private administration. Trusted proxy boundaries.",
    sections: [
      {
        id: "admin",
        title: "Keep administration deliberate",
        text: "The admin server defaults to 127.0.0.1:9090. Inside Docker, binding to loopback prevents access through a published container port. If you deliberately enable external access, configure DR_ADMIN_BIND and set DR_ADMIN_USER and DR_ADMIN_PASS. Prefer a private network or an SSH forward.",
        // biome-ignore lint/suspicious/noTemplateCurlyInString: Literal Compose environment interpolation.
        code: 'environment:\n  DR_ADMIN_BIND: "0.0.0.0"\n  DR_ADMIN_USER: "admin"\n  DR_ADMIN_PASS: "${DOCKROUTER_ADMIN_PASSWORD}"',
        note: "Provide DOCKROUTER_ADMIN_PASSWORD through your deployment environment. Do not commit credentials to Compose files. A public admin port needs network-level protection too.",
      },
      {
        id: "ip",
        title: "Trust forwarded IPs only from your proxies",
        text: "Client IP filtering uses forwarded headers only for proxies listed in DR_TRUSTED_IPS. Without trusted proxy CIDRs it uses the peer address. Include only the networks of reverse proxies you operate or explicitly trust.",
        code: 'DR_TRUSTED_IPS=10.0.0.0/8\n# Per-service labels:\ndr.ipwhitelist: "192.168.0.0/16,10.0.0.0/8"\ndr.ipblacklist: "192.168.100.1/32"',
      },
      {
        id: "limits",
        title: "Set limits per service",
        text: "Configure rate windows with dr.ratelimit, choose a rate-limit key with dr.ratelimit.by, and constrain request size with dr.maxbody.",
        code: 'dr.ratelimit: "100/m"\ndr.ratelimit.by: "client_ip"\ndr.maxbody: "10mb"',
      },
      {
        id: "cors",
        title: "Define browser access",
        text: "Use explicit CORS origins and methods for your application. These settings govern browser access; they do not replace authentication or authorization in the service.",
        code: 'dr.cors.origins: "https://app.example.com"\ndr.cors.methods: "GET,POST,PUT,DELETE"',
      },
    ],
  },
  {
    slug: "observability",
    title: "Dashboard & metrics",
    category: "Operate",
    description:
      "Follow routes, certificates and requests from the same router.",
    sections: [
      {
        id: "dashboard",
        title: "A dashboard in the binary",
        text: "The admin interface on port 9090 provides access to routes, discovered containers, certificates and router status. Set up private access and credentials before using the interface over a network.",
      },
      {
        id: "health",
        title: "Health and readiness",
        text: "The /health and /ready endpoints are intentionally unauthenticated for probes. Other admin API paths and /metrics require admin credentials when DR_ADMIN_USER is configured.",
        code: "curl http://127.0.0.1:9090/health\ncurl http://127.0.0.1:9090/ready",
      },
      {
        id: "metrics",
        title: "Prometheus metrics",
        text: "Scrape /metrics to observe request counts, latency, errors, active connections and backend behavior. Configure your monitoring system to authenticate when admin credentials are enabled.",
        code: "curl -u admin http://127.0.0.1:9090/metrics",
        table: [
          ["Metric", "What it describes"],
          ["dockrouter_http_requests_total", "Total requests"],
          [
            "dockrouter_http_request_duration_seconds",
            "Request latency histogram",
          ],
          [
            "dockrouter_http_errors_total",
            "Responses with status 400 or higher",
          ],
          ["dockrouter_active_connections", "Active backend connections"],
          ["dockrouter_routes_total", "Active routes"],
        ],
      },
      {
        id: "api",
        title: "Inspect the admin API",
        text: "The dashboard uses the same REST endpoints and an event stream that refreshes route, container and certificate state without polling.",
        table: [
          ["Endpoint", "Purpose"],
          ["GET /api/v1/routes", "Routes and backends"],
          ["GET /api/v1/containers", "Discovered containers"],
          ["GET /api/v1/certificates", "Certificate state"],
          ["GET /api/v1/status", "Router status"],
          ["GET /api/v1/config", "Current configuration"],
          ["GET /api/v1/metrics", "JSON metrics"],
          ["GET /api/v1/events", "Server-sent events"],
        ],
      },
    ],
  },
  {
    slug: "architecture",
    title: "Inside the router",
    category: "Reference",
    description: "One process, from incoming connection to container backend.",
    sections: [
      {
        id: "flow",
        title: "Follow the request path",
        text: "HTTP and HTTPS listeners feed the middleware chain, which handles routing policy and forwards requests to the selected backend pool. Docker discovery updates route state alongside this request path.",
        code: "Internet :80 / :443\n        │\n        ▼\n  TLS + middleware\n        │\n        ▼\n  Host / path router ◀── Docker discovery\n        │                 │\n        ▼                 ▼\n    Backend pool      Docker socket\n        │\n        ▼\n    Your containers",
      },
      {
        id: "runtime",
        title: "A standard-library runtime",
        text: "DockRouter is implemented in Go using the standard library. The runtime does not need a separate configuration service or a hosted control plane. The marketing website is a separate Next.js application.",
      },
      {
        id: "streaming",
        title: "Leave connections open when they need to be",
        text: "The proxy supports WebSocket upgrades and streaming HTTP responses, including server-sent events. Responses are streamed rather than accumulated as complete bodies before forwarding.",
      },
      {
        id: "boundaries",
        title: "Know the deployment boundaries",
        text: "DockRouter is a Docker ingress router, not a container orchestrator. Your deployment still owns networking, DNS, storage, application authorization, backups and host security. Automatic discovery needs access to the Docker daemon.",
      },
    ],
  },
  {
    slug: "configuration",
    title: "Configuration reference",
    category: "Reference",
    description:
      "Global environment variables and service-level middleware labels.",
    sections: [
      {
        id: "environment",
        title: "Global environment",
        text: "Global settings use the DR_ prefix. Their command-line equivalents are also available; use dockrouter --help for the options in your installed release.",
        table: [
          ["Variable", "Default", "Purpose"],
          ["DR_HTTP_PORT", "80", "HTTP listener"],
          ["DR_HTTPS_PORT", "443", "HTTPS listener"],
          ["DR_ADMIN_PORT", "9090", "Admin listener port"],
          ["DR_ADMIN_BIND", "127.0.0.1", "Admin bind address"],
          ["DR_ADMIN", "true", "Enable admin interface"],
          ["DR_DOCKER_SOCKET", "/var/run/docker.sock", "Docker API socket"],
          ["DR_DATA_DIR", "/data", "Persistent state directory"],
          ["DR_ACME_EMAIL", "—", "ACME account email"],
          ["DR_ACME_STAGING", "false", "ACME staging environment"],
          ["DR_DEFAULT_TLS", "auto", "Default route TLS mode"],
          ["DR_LOG_LEVEL", "info", "Logging verbosity"],
          ["DR_TRUSTED_IPS", "—", "Trusted proxy CIDRs"],
        ],
      },
      {
        id: "middleware",
        title: "Middleware labels",
        text: "Add middleware settings to the application container, alongside its routing labels.",
        table: [
          ["Label", "Example"],
          ["dr.ratelimit", "100/m"],
          ["dr.cors.origins", "https://app.example.com"],
          ["dr.compress", "true"],
          ["dr.maxbody", "10mb"],
          ["dr.stripprefix", "/api"],
          ["dr.addprefix", "/v1"],
          ["dr.retry", "2"],
          ["dr.circuitbreaker", "5/30s"],
          ["dr.auth.basic.users", "user:bcrypt_hash"],
        ],
      },
      {
        id: "cli",
        title: "Useful CLI commands",
        text: "Version, help and a container health check are available directly from the binary.",
        code: "dockrouter version\ndockrouter --help\ndockrouter healthcheck",
      },
    ],
  },
];
