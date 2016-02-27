/**
 * Parser for WordPress Trac Logs
 */

var parseArgs = require( 'minimist' ),
	async = require( 'async' ),
	request = require( 'request' ),
	buildOutput = require( './lib/build_output' ),
	gatherComponents = require( './lib/gather_components' ),
	buildChangesets = require( './lib/build_changesets' );

var logPath, logHTML,
	changesets = [],
	args = parseArgs(process.argv.slice(2), {
		'alias': {
			'start': ['to'],
			'stop': ['from']
		},
		'default': {
			'limit': 400
		}
	}),
	startRevision = parseInt(args['start'], 10),
	stopRevision = parseInt(args['stop'], 10),
	revisionLimit = parseInt(args['limit'], 10);

if ( isNaN(startRevision) || isNaN(stopRevision) ) {
	console.log( "Usage: node parse_logs.js --start=<start_revision> --stop=<revision_to_stop> [--limit=<total_revisions>]\n" );
	process.exit();
}

logPath = "https://core.trac.wordpress.org/log?rev=" + startRevision + "&stop_rev=" + stopRevision + "&limit=" + revisionLimit + "&verbose=on";

async.waterfall([
	function( logCallback ) {
		console.log( "Downloading " + logPath );
		request( logPath, function( err, response, html ) {
			if ( ! err && response.statusCode == 200 ) {
				logCallback( null, html );
			} else {
				console.log( "Error Downloading.");
				return err;
			}
		});
	},
	buildChangesets,
	gatherComponents,
	buildOutput
]);
