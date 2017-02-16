/*jslint browser: true */
define( function() {
    'use strict';

    return {

        /**
         * @param {string} name
         * @param {function()} require
         * @param {function()} onload
         * @param {Object} config
         */
        load: function( name, require, onload, config ) {
            var xhr = new XMLHttpRequest();

            xhr.open( 'GET', name, true );
            xhr.responseType = 'arraybuffer';

            xhr.onload = function( evt ) {
                onload( this.response );
            };

            xhr.send();
        }
    };
} );