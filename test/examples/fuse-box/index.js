"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDOM = require("react-dom");
const components_1 = require("tsx-control-statements/components");
class Example extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { things: ['this', 'is', 'DEMOOO!'] };
        this._onChange = event => this.setState({ things: event.target.value.split(' ').filter(Boolean) });
    }
    render() {
        const { things } = this.state;
        return (React.createElement("div", null,
            React.createElement("input", { type: "text", onChange: this._onChange }),
            React.createElement(components_1.Choose, null,
                React.createElement(components_1.When, { condition: things.length > 0 },
                    React.createElement("h1", null,
                        things.length,
                        " thingies:"),
                    React.createElement(components_1.For, { each: "thingy", index: "i", of: things },
                        React.createElement("p", { key: i },
                            i,
                            ". ",
                            thingy))),
                React.createElement(components_1.Otherwise, null, "no thingies :("))));
    }
}
exports.default = Example;
ReactDOM.render(React.createElement(Example, null), document.getElementById('app-container'));
