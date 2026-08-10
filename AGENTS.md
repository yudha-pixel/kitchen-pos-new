<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Process & Server Lifecycle Rule
- **Server Shutdown After Testing**: Whenever dev servers or background test processes (e.g. Next.js server, Express API server) are started for testing or verification, ensure they are properly shut down / killed after testing is completed.

