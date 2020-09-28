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
// default/choose.jsx
$fsx.f[0] =
function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
exports.ChooseNested = exports.ChooseMultipleChildren = exports.ChooseWithOtherwise = void 0;
const React = require('react');
;
exports.ChooseWithOtherwise = {
    component: ({name}) => React.createElement('div', null, name === 'gosho' ? 'gosho in da house' : 'gosho pie bira sig'),
    dataSet: [
        [
            'gosho',
            'renders child of When'
        ],
        [
            'pesho',
            'renders child of Otherwise'
        ]
    ].map(([name, message]) => ({
        props: { name },
        message
    }))
};
exports.ChooseMultipleChildren = {
    component: ({name}) => React.createElement('div', null, name === 'ivan' ? [
        React.createElement('h1', null, 'kek'),
        React.createElement('p', null, 'ivan is here'),
        name + ' is haskell dev'
    ] : [
        React.createElement('h2', null, 'topkek'),
        React.createElement('p', null, 'it is not ivan, but rather ', name),
        React.createElement('b', null, 'neshto si neshto si')
    ]),
    dataSet: [
        [
            'ivan',
            'renders children of When'
        ],
        [
            'hristofor',
            'renders children of Otherwise'
        ]
    ].map(([name, message]) => ({
        props: { name },
        message
    }))
};
exports.ChooseNested = {
    component: ({name}) => React.createElement('div', null, name.length < 3 ? name.length === 0 ? 'name cannot be empty' : 'name too short' : [
        name.length > 20 ? 'name too long' : name,
        'sdf'
    ]),
    dataSet: [
        [
            '',
            'When -> When'
        ],
        [
            'ja',
            'When -> Otherwise'
        ],
        [
            Array.from({ length: 30 }).fill('a').join(''),
            'Otherwise -> When'
        ],
        [
            'horse',
            'Otherwise -> Otherwise'
        ]
    ].map(([name, message]) => ({
        props: { name },
        message: `renders ${ message }`
    }))
};
}
module.exports = $fsx.r(0)

