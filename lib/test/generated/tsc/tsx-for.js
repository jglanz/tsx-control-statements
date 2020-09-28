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
exports.LoopBody = exports.ForWithIterable = exports.EmptyFor = exports.BadBodyProp = exports.NoOf = exports.CanUseControlStatementsInBody = void 0;
const React = require('react');
;
exports.CanUseControlStatementsInBody = {
    actual: ({words}) => React.createElement('div', null, Array.from(words, (w, i) => i % 2 === 0 ? [
        w,
        w.length <= 3 ? 'stuff' : null
    ] : w + ` ` + w)),
    expected: ({words}) => React.createElement('div', null, words.map((w, i) => i % 2 === 0 ? w + (w.length <= 3 ? 'stuff' : '') : `${ w } ${ w }`)),
    dataSet: [{
            props: {
                words: [
                    'big',
                    'papa',
                    'top',
                    'kek'
                ]
            },
            message: 'Control statements in for loop body are transformed'
        }]
};
exports.NoOf = {
    expected: () => null,
    actual: () => Array.from([], test => 'haha'),
    dataSet: [{
            props: {},
            message: 'renders null'
        }]
};
exports.BadBodyProp = {
    expected: () => React.createElement('p', null, '123'),
    actual: () => React.createElement('p', null, Array.from([
        1,
        2,
        3
    ], i => i)),
    dataSet: [{
            props: {},
            message: 'uses for children when body is bad'
        }]
};
exports.default = {
    expected: ({chaps}) => React.createElement('ol', null, Array.from(chaps, (chap, i) => React.createElement('li', { key: chap }, i, React.createElement('strong', null, chap), chap.length > 10 ? 'a long one!' : null))),
    actual: ({chaps}) => React.createElement('ol', null, chaps.map((chap, i) => React.createElement('li', { key: chap }, i, React.createElement('strong', null, chap), chap.length > 10 ? 'a long one!' : null))),
    dataSet: [
        [
            [],
            'renders empty ol'
        ],
        [
            [
                'steeve joobs',
                'bil gaytes',
                'lightlin naakov'
            ],
            'renders a li for every chap'
        ]
    ].map(([chaps, message]) => ({
        props: { chaps },
        message
    }))
};
exports.EmptyFor = {
    expected: ({peshovci}) => React.createElement('ul', null, 'transformerfactory', null),
    actual: () => React.createElement('ul', null, 'transformerfactory'),
    dataSet: [{
            props: {
                peshovci: [
                    1,
                    2,
                    3
                ]
            },
            message: 'empty for renders nothing'
        }]
};
exports.ForWithIterable = {
    expected: ({xs}) => React.createElement('ol', null, Array.from(xs, (kvp, i) => React.createElement('span', { key: kvp[0] }, 'pair ', i, ' with key ', kvp[0], ' and value ', kvp[1]))),
    actual: ({xs}) => React.createElement('ol', null, Array.from(xs, (kvp, i) => React.createElement('span', { key: kvp[0] }, 'pair ', i, ' with key ', kvp[0], ' and value ', kvp[1]))),
    dataSet: [
        {
            props: { xs: new Map() },
            message: 'renders no pairs for empty iterator'
        },
        {
            props: {
                xs: new Map([
                    [
                        'a',
                        2
                    ],
                    [
                        'c',
                        15
                    ],
                    [
                        'd',
                        69
                    ]
                ])
            },
            message: 'uses the elements yielded by the iterator'
        }
    ]
};
exports.LoopBody = {
    expected: ({xs}) => React.createElement('ol', null, Array.from(xs, (x, i) => React.createElement(React.Fragment, null, x, React.createElement('p', null, x * i)))),
    actual: ({xs}) => React.createElement('ol', null, Array.from(xs, (x, i) => React.createElement(React.Fragment, null, x, React.createElement('p', null, x * i)))),
    dataSet: [
        {
            props: {
                xs: [
                    1,
                    5,
                    13
                ]
            },
            message: 'executes all iterations when provided with a function for body'
        },
        {
            props: { xs: [] },
            message: 'does not crash with empty input'
        },
        {
            props: {
                get xs() {
                    return new Map([
                        [
                            1,
                            'dsf'
                        ],
                        [
                            2,
                            'zdr'
                        ],
                        [
                            5,
                            'krp'
                        ],
                        [
                            8,
                            'kyp'
                        ]
                    ]).keys();
                }
            },
            message: 'arrow body works with iterators'
        }
    ]
};
}
module.exports = $fsx.r(0)

