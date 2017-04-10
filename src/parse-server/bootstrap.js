import parse from 'parse/node';
import config from './config';

parse.initialize(config.applicationId, config.javascriptKey);
parse.serverURL = config.serverUrl;
