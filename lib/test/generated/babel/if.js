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
exports.IfMultipleProps = exports.EmptyNestedIfs = exports.EmptyIfs = exports.NestedIfs = exports.IfConditionIsExpressions = exports.IfChildExpressionsAndElements = exports.IfChildExpressions = exports.IfSelfClosingChildElements = exports.IfChildElements = void 0;
const React = require('react');
const ListFive = ({messages}) => React.createElement('ul', null, messages.slice(0, 5).map((m, i) => React.createElement('li', { key: i }, m)));
const selfClosingElements = [
    React.createElement('img', { src: 'https://cukii.me/img/Ripples-larry.svg' }),
    React.createElement(ListFive, { messages: '123456'.split('') }),
    React.createElement('input', {
        type: 'text',
        placeholder: 'fun'
    })
];
exports.IfChildElements = {
    component: ({condition}) => React.createElement('div', null, React.createElement('h1', null, 'useful links'), condition ? [
        React.createElement('a', { href: 'https://wiki.gentoo.org/wiki/Handbook:Main_Page' }, 'install gentoo'),
        React.createElement('a', { href: 'https://github.com' }, 'github')
    ] : null),
    dataSet: [
        {
            props: { condition: true },
            message: 'renders links'
        },
        {
            props: { condition: false },
            message: 'does not render links'
        }
    ]
};
exports.IfSelfClosingChildElements = {
    component: ({condition}) => React.createElement('section', null, condition ? selfClosingElements : null),
    dataSet: [
        {
            props: { condition: true },
            message: 'renders self-closing children'
        },
        {
            props: { condition: false },
            message: 'does not render self-closing'
        }
    ]
};
exports.IfChildExpressions = {
    component: ({a, b, condition}) => React.createElement('div', null, React.createElement('h1', null, 'maths'), condition ? [
        '3 + 4 = ',
        3 + 4,
        a,
        ' + ',
        b,
        ' = ',
        a + b
    ] : null),
    dataSet: [
        [
            7,
            8,
            false,
            'does not render child expressions'
        ],
        [
            7,
            8,
            true,
            'renders child expressions'
        ]
    ].map(([a, b, condition, message]) => ({
        props: {
            a,
            b,
            condition
        },
        message
    }))
};
exports.IfChildExpressionsAndElements = {
    component: ({a, b, condition}) => React.createElement('div', null, React.createElement('h1', null, 'maths'), condition ? [
        '3 + 4 = ',
        3 + 4,
        React.createElement('a', { href: 'https://wiki.gentoo.org/wiki/Handbook:Main_Page' }, 'install gentoo'),
        React.createElement('a', { href: 'https://github.com' }, 'github'),
        a,
        ' + ',
        b,
        ' = ',
        a + b,
        selfClosingElements
    ] : null),
    dataSet: JSON.parse(JSON.stringify(exports.IfChildExpressions.dataSet))
};
exports.IfConditionIsExpressions = {
    component: ({name1, name2}) => React.createElement('article', null, name1.length !== 0 ? React.createElement('h1', null, 'First: ', name1) : null, name1 !== name2 && name2.length !== 0 ? React.createElement('h2', null, 'Second: ', name2) : null),
    dataSet: [
        [
            'gosho',
            'vancho',
            'boolean expressions as conditions work'
        ],
        [
            '',
            'vancho',
            'boolean expressions as conditions work'
        ]
    ].map(([name1, name2, message]) => ({
        props: {
            name1,
            name2
        },
        message
    }))
};
exports.NestedIfs = {
    component: ({a, b}) => React.createElement('div', null, a % 2 === 1 ? [
        React.createElement('h1', null, 'a is add'),
        b % 2 === 1 ? 'b is odd' : null,
        b % 2 === 0 ? 'b is even' : null
    ] : null),
    dataSet: [
        [
            0,
            1,
            'does not render nested content'
        ],
        [
            3,
            1,
            'renders nested content correctly'
        ],
        [
            3,
            2,
            'renders nested content correctly'
        ]
    ].map(([a, b, message]) => ({
        props: {
            a,
            b
        },
        message
    }))
};
exports.EmptyIfs = {
    component: ({a, b}) => React.createElement('p', null, b % 2 === 1 ? [] : null, b % 2 === 0 ? [] : null),
    dataSet: [{
            props: {},
            message: 'renders nothing'
        }]
};
exports.EmptyNestedIfs = {
    component: ({a, b}) => React.createElement('p', null, a % 2 === 1 ? [
        b % 2 === 1 ? [] : null,
        b % 2 === 0 ? [] : null
    ] : null),
    dataSet: [
        [
            0,
            1
        ],
        [
            0,
            2
        ],
        [
            1,
            2
        ],
        [
            1,
            3
        ]
    ].map(([a, b]) => ({
        props: {
            a,
            b
        },
        message: 'never do this. please'
    }))
};
exports.IfMultipleProps = {
    component: ({condition}) => React.createElement('p', null, condition ? React.createElement('b', null, 'kljsdfjklsdfjklsdfjkl') : null),
    dataSet: [
        {
            props: { condition: true },
            message: 'renders content'
        },
        {
            props: { condition: false },
            message: 'does not render content'
        }
    ]
};
}
module.exports = $fsx.r(0)

