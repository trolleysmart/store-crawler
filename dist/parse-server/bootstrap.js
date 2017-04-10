'use strict';

var _node = require('parse/node');

var _node2 = _interopRequireDefault(_node);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_node2.default.initialize(_config2.default.applicationId, _config2.default.javascriptKey);
_node2.default.serverURL = _config2.default.serverUrl;