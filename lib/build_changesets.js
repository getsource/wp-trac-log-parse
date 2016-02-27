var $ = require( 'cheerio' );

module.exports = function( logHTML, callback ) {
	console.log( 'Downloaded. Processing Changesets.' );
	
	var changesets = [],
	logEntries = $.load( logHTML )( 'tr.verbose' );
	// Each Changeset has two Rows. We Parse them both at once.
	for (var i = 0; i < logEntries.length; i += 2) {
		var changeset = {},
			props, description, related;

		if ( logEntries[i+1] == null ) {
			break;
		}

		changeset['revision'] = $( logEntries[i] ).find( 'td.rev' ).text().trim().replace( /@(.*)/, '[$1]' );
		changeset['author']   = $( logEntries[i] ).find( 'td.author' ).text().trim();

		description = $( logEntries[i+1] ).find( 'td.log' );

		// Store 'Fixes' or 'See' tickets.
		changeset['related'] = [];
		changeset['component'] = [];
		$(description).find( 'a.ticket' ).each( function() {
			var ticket = $(this).text().trim().replace( /#(.*)/, '$1' );
			changeset['related'].push( ticket );
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

		changesets.push( changeset );
	}
	callback( null, changesets );
};