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
exports.MisplacedOtherwise = exports.EmptyWhen = exports.EmptyChoose = void 0;
const React = require('react');
;
exports.default = {
    actual: ({str}) => React.createElement('article', null, str === 'ivan' ? 'ivancho' : str === 'sarmi' ? React.createElement('h1', null, 'yum!') : 'im the queen da da da da'),
    expected: ({str}) => React.createElement('article', null, str === 'ivan' ? 'ivancho' : str === 'sarmi' ? React.createElement('h1', null, 'yum!') : 'im the queen da da da da'),
    dataSet: [
        [
            'ivan',
            'renders first When'
        ],
        [
            'sarmi',
            'renders second When'
        ],
        [
            'banana',
            'renders Otherwise'
        ]
    ].map(([str, message]) => ({
        props: { str },
        message
    }))
};
exports.EmptyChoose = {
    actual: () => React.createElement('div', null, '123', null, '123'),
    expected: () => React.createElement('div', null, '123123'),
    dataSet: [{
            props: {},
            message: 'empty choose is not rendered'
        }]
};
exports.EmptyWhen = {
    actual: props => React.createElement('div', null, '123', null, '123'),
    expected: () => React.createElement('div', null, '123123'),
    dataSet: [{
            props: {},
            message: 'empty when is not rendered'
        }]
};
exports.MisplacedOtherwise = {
    actual: () => React.createElement('div', null, '123', false ? '1' : true ? '2' : '3'),
    expected: () => React.createElement('div', null, '1232'),
    dataSet: [{
            props: {},
            message: 'misplaced otherwise elements are skipped'
        }]
};
}
module.exports = $fsx.r(0)

