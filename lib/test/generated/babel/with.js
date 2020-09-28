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
// default/with.jsx
$fsx.f[0] =
function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
exports.WithNested = exports.WithNoVariables = exports.WithManyVariables = exports.WithOneVariable = void 0;
const React = require('react');
exports.WithOneVariable = {
    component: ({n}) => React.createElement('div', null, (even => even ? 'kek' : 'topkek')(n % 2 === 0)),
    dataSet: [
        [
            2,
            'binding value is true'
        ],
        [
            1,
            'binding value is false'
        ]
    ].map(([n, message]) => ({
        props: { n },
        message
    }))
};
exports.WithManyVariables = {
    component: ({x, firstName, lastName, people}) => React.createElement('div', null, ((salary, fullName, employeesCount) => [
        React.createElement('b', null, fullName),
        ' is a promising young entepreneur from Kazichene. He currently has ',
        employeesCount,
        ' employees and pays each of them ',
        salary,
        ' per month.'
    ])(x + 42, firstName + ' ' + lastName, people.length)),
    dataSet: [{
            props: {
                x: 3,
                firstName: 'remove',
                secondName: 'ceiling',
                people: [
                    'penka',
                    'kaka ginka',
                    'lightlin naakov'
                ]
            },
            message: 'works for multiple bindings'
        }]
};
exports.WithNoVariables = {
    component: ({thing}) => React.createElement('div', null, (() => [
        'This ',
        thing,
        ' is idiotic'
    ])()),
    dataSet: [{
            props: { thing: 'control statements thing' },
            message: 'works with no variables'
        }]
};
exports.WithNested = {
    component: ({xs}) => React.createElement('div', null, (fst => [
        fst + 1,
        (snd => [
            fst + snd,
            (last => last)(xs.slice(-1).pop()),
            (sum => [
                React.createElement('p', null, fst),
                React.createElement('p', null, sum),
                snd
            ])(xs.reduce((sum, n) => sum + n, 0))
        ])(xs[1])
    ])(xs[0])),
    dataSet: [{
            props: {
                xs: [
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    42,
                    69
                ]
            },
            message: 'works when some idiot nests 3 Withs'
        }]
};
}
module.exports = $fsx.r(0)

