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
// default/for.jsx
$fsx.f[0] =
function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
exports.ForNested = exports.ForEmptyArray = exports.ForKeyIndex = exports.ForIndex = exports.ForLongNames = exports.ForChildrenExpressions = void 0;
const React = require('react');
const nextKey = () => Math.random() + String(Math.random() * 10000 * Math.random());
exports.ForChildrenExpressions = {
    component: ({words}) => React.createElement('article', null, Array.from(words, (w, i) => [
        3 + 4,
        React.createElement('i', { key: nextKey() }, i, '. '),
        React.createElement('p', { key: nextKey() }, w)
    ])),
    dataSet: [
        [
            [],
            'same with []'
        ],
        [
            [
                'gosho',
                'pesho',
                'gg'
            ],
            'same with non-empty array'
        ]
    ].map(([words, message]) => ({
        props: { words },
        message
    }))
};
exports.ForLongNames = {
    component: () => React.createElement('ul', null, Array.from([
        1,
        2,
        3,
        42,
        69,
        666,
        1024
    ], (number, index) => React.createElement('li', { key: nextKey() }, number * index))),
    dataSet: [{
            props: {},
            message: 'works with longer bindings names'
        }]
};
exports.ForIndex = {
    component: () => React.createElement('p', null, Array.from([
        1,
        2,
        3,
        42,
        69,
        666,
        1024
    ], (number, index) => index)),
    dataSet: [{
            props: {},
            message: 'index binding works'
        }]
};
exports.ForKeyIndex = {
    component: () => React.createElement('ul', null, Array.from([
        1,
        2,
        3,
        42,
        69,
        666,
        1024
    ], (number, index) => React.createElement('li', { key: index }, number * index))),
    dataSet: [{
            props: {},
            message: 'can use index binding as key'
        }]
};
exports.ForEmptyArray = {
    component: () => React.createElement('ul', null, Array.from([], (number, index) => React.createElement('li', { key: index }, number * index))),
    dataSet: [{
            props: {},
            message: 'works with empty array'
        }]
};
exports.ForNested = {
    component: ({xs, ys}) => React.createElement('ol', null, Array.from(xs, (x, i) => React.createElement('li', null, React.createElement('ol', null, Array.from(ys, (y, j) => React.createElement('li', null, '[', i, ', ', j, '] = (', x, ', ', y, ')')))))),
    dataSet: [
        [
            [],
            []
        ],
        [
            [],
            [
                1,
                2,
                3
            ]
        ],
        [
            [
                1,
                2
            ],
            []
        ],
        [
            [
                4,
                2,
                1
            ],
            [
                'i',
                'hate',
                'nested',
                'ctrl',
                'flow'
            ]
        ]
    ].map(([xs, ys]) => ({
        props: {
            xs,
            ys
        },
        message: `works for [${ xs }] and [${ ys }]`
    }))
};
}
module.exports = $fsx.r(0)

