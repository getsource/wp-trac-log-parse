var async = require( 'async' ),
	$ = require( 'cheerio' ),
	_ = require( 'underscore' ),
	request = require( 'request' );

module.exports = function( changesets, gatherCallback ) {
	var ticketPath = 'https://core.trac.wordpress.org/ticket/';

	async.map( changesets, function( changeset, changesetCallback ) {
		var ticket = _.first( changeset.related );
		request( ticketPath + ticket, function( err, response, body ) {
			if ( ! err && response.statusCode == 200 ) {
				component = $.load( body )( '#h_component' ).next( 'td' ).text().trim();
				changeset['component'].push( component );
			}
			changesetCallback( null, changeset );
		} );
	},
	function( err, changesetsWithComponent ) {
		gatherCallback( err, changesetsWithComponent );
	} );
};
