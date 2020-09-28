(function() {
	if (typeof global === "object") {
		global.require = require;
	}
	var $fsx = (global.$fsx = {});
	if ($fsx.r) {
		return;
	}
	$fsx.f = {};
	// cached modules
	$fsx.m = {};
	$fsx.r = function(id) {
		var cached = $fsx.m[id];
		// resolve if in cache
		if (cached) {
			return cached.m.exports;
		}
		var file = $fsx.f[id];
		if (!file) return;
		cached = $fsx.m[id] = {};
		cached.exports = {};
		cached.m = { exports: cached.exports };
		file.call(cached.exports, cached.m, cached.exports);
		return cached.m.exports;
	};
})();
// default/if.jsx
$fsx.f[0] =
function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
exports.EmptyIf = exports.WithSelfClosingElementChild = void 0;
const React = require('react');
;
exports.default = {
    actual: ({songList}) => React.createElement('p', null, songList.includes(`Gery-Nikol - I'm the Queen`) ? 'good taste in music' : null),
    expected: ({songList}) => React.createElement('p', null, songList.includes(`Gery-Nikol - I'm the Queen`) ? 'good taste in music' : null),
    dataSet: [
        [
            [
                'Iron Maiden - The Monad (Horse & Penguin cover)',
                'Britney - Toxic'
            ],
            'renders text'
        ],
        [
            [
                'Iron Maiden - The Monad (Horse & Penguin cover)',
                'Britney - Toxic',
                `Gery-Nikol - I'm the Queen`
            ],
            'does not render text'
        ]
    ].map(([songList, message]) => ({
        props: { songList },
        message
    }))
};
exports.WithSelfClosingElementChild = {
    actual: ({n}) => React.createElement('div', null, 'some text', n > 2 ? React.createElement('img', { src: 'https://cukii.me/img/Ripples-larry.svg' }) : null),
    expected: ({n}) => React.createElement('div', null, 'some text', n > 2 ? React.createElement('img', { src: 'https://cukii.me/img/Ripples-larry.svg' }) : null),
    dataSet: [
        {
            props: { n: 1 },
            message: 'works with self-closing children when condition is false'
        },
        {
            props: { n: 5 },
            message: 'works with self-closing children when condition is true'
        }
    ]
};
exports.EmptyIf = {
    actual: () => React.createElement('p', null, '123', true ? 'df' : null, 'neshto si'),
    expected: () => React.createElement('p', null, '123neshto si'),
    dataSet: [{
            props: {},
            message: 'empty if does not render anything'
        }]
};
}
module.exports = $fsx.r(0)

