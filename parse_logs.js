/**
 * Parser for WordPress Trac Logs
 */

var $ = require( "cheerio" ),
	_ = require("underscore" ),
	argv = require( "minimist" )( process.argv.slice(2) ),
	request = require( "request" );

function parseLog(error, response, html) {
	console.log( "Downloaded. Processing Changesets." );

	var logEntries = $.load( html )( "tr.verbose" ),
		changesets = [],
		changesetOutput = "",
		propsOutput = "";

	// Each Changeset has two Rows. We Parse them both at once.
	for (var i = 0; i < logEntries.length; i += 2) {
		var changeset = {},
			props, description, related;

		if ( logEntries[i+1] == null ) {
			break;
		}

		changeset['revision'] = $( logEntries[i] ).find( "td.rev" ).text().trim().replace( /@(.*)/, "[$1]" );
		changeset['author']   = $( logEntries[i] ).find( "td.author" ).text().trim();
		
		description = $( logEntries[i+1] ).find( "td.log" );

		// Re-add `` for code segments.
		$(description).find( "tt" ).each( function() {
			$(this).replaceWith( "`" + $(this).text() + "`" );
		});

		// Store and strip "Related" or "See" tickets.
		changeset['related'] = [];
		$(description).find( "a.ticket" ).each( function() {
			changeset['related'].push( $(this).text().trim() );
		});

		// Create base description
		changeset['description'] = description.text();

		// For now, get rid of Fixes and See notes. Should we annotate in summary?
		changeset['description'] = changeset['description'].replace( /[\n|, ]Fixes(.*)/i, '' );
		changeset['description'] = changeset['description'].replace( /\nSee(.*)/i, '' );

		// Extract Props
		var propsRegex = /\nProps(.*)./i;
		changeset['props'] = [];

		var props = changeset['description'].match( propsRegex );
		if ( props !== null ) {
			changeset['props'] = props[1].trim().split( /\s*,\s*/ );
		}

		// Remove Props
		changeset['description'] = changeset['description'].replace( propsRegex, '' );

		// Limit to 2 consecutive carriage returns
		changeset['description'] = changeset['description'].replace( /\n\n\n+/g, '\n\n' );
		changeset['description'] = changeset['description'].trim();

		changesets.push(changeset);
	}

	// Reconstitute Log and Collect Props
	var props = [];
	for ( var i = 0; i < changesets.length; i++ ) {
		changesetOutput += "* " +
			changesets[i]['description'].trim() + " " +
			changesets[i]['revision'] + " " +
			changesets[i]['related'].join(', ') + "\n";

		// Sometimes Committers write their own code.
		// When this happens, there are no props.
		if (changesets[i]['props'].length != 0) {
			props = props.concat(changesets[i]['props']);
		}
	}

	// Collect Props and sort them.
	props = _.uniq( props.sort( function ( a, b ) {
			return a.toLowerCase().localeCompare( b.toLowerCase() );
		}), true );

	propsOutput = "Thanks to " + "@" + _.without( props, _.last( props ) ).join( ", @" ) +
		", and @" + _.last( props ) + " for their contributions!";

	// Output our post!
	console.log( changesetOutput );
	console.log( propsOutput );
}

var logPath,
	startRevision = argv['start'],
	stopRevision  = argv['stop'],
	revisionLimit = argv['limit'];

if ( startRevision == undefined || stopRevision == undefined ) {
	console.log( "Usage: node parse_logs.js --start=<start_revision> --stop=<revision_to_stop> [--limit=<total_revisions>]\n" );
	return;
}

// Default Limit of Revisions to 400
if ( revisionLimit == undefined ) {
	revisionLimit = 400;
}

logPath = "https://core.trac.wordpress.org/log?rev=" + startRevision + "&stop_rev=" + stopRevision + "&limit=" + revisionLimit + "&verbose=on";

console.log( "Downloading " + logPath );
request(logPath, parseLog);

