var _ = require( 'underscore' ),
	async = require( 'async' );

module.exports = function( changesets, outputCallback ) {
	// Reconstitute Log and Collect Props
	var propsOutput,
		changesetOutput = '',
		props = [],
		categories = {};

	async.map( changesets, function( item ) {
		category = item['component'];

		if ( ! category ) {
			category = 'Misc';
		}

		if ( ! categories[category] ) {
			categories[category] = [];
		}

		categories[item['component']].push( item );
	} );

	_.each( categories, function( category ) {
		changesetOutput += '### ' + category[0]['component'] + '\n';
		_.each( category, function( changeset ) {

			changesetOutput += '* ' +
				changeset['description'].trim() + ' ' +
				changeset['revision'] + ' ' +
				'#' + changeset['related'].join(', #') + '\n';

			// Make sure Committers get credit
			props.push( changeset['author'] );

			// Sometimes Committers write their own code.
			// When this happens, there are no additional props.
			if ( changeset['props'].length != 0 ) {
				props = props.concat( changeset['props'] );
			}

		});

		changesetOutput += '\n';
	});

	// Collect Props and sort them.
	props = _.uniq( props.sort( function ( a, b ) {
			return a.toLowerCase().localeCompare( b.toLowerCase() );
		}), true );

	propsOutput = 'Thanks to ' + '@' + _.without( props, _.last( props ) ).join( ', @' ) +
		', and @' + _.last( props ) + ' for their contributions!';

	// Output!
	console.log( changesetOutput + '\n\n' + propsOutput );
	outputCallback();
};