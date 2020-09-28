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
const React = require('react');
;
exports.default = {
    actual: () => React.createElement('p', null, ((gosho, pesho, tosho) => gosho + pesho + tosho)(3, 5, 6)),
    expected: () => React.createElement('p', null, 14),
    dataSet: [{
            props: {},
            message: 'bindings defined in With are available in the children expressions'
        }]
};
}
module.exports = $fsx.r(0)

