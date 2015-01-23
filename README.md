wp-trac-log-parse
=================

Node.js Parser for WordPress Trac Logs.

Meant to generate the starting point for a [weekly WordPress core news update](https://make.wordpress.org/core/tag/week-in-core/).

# Usage
`node parse_logs.js --start=<start_revision> --stop=<revision_to_stop> [--limit=<total_revisions>]`

# Installation
- [Install Node.js](http://nodejs.org/), if you need it.
- Go to directory you regularly store commands in
- `git clone https://github.com/getsource/wp-trac-log-parse`
- `cd wp-trac-log-parse`
- `npm install`
- Done! You can now run the parser per the usage above.
