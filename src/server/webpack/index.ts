import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware = require('webpack-hot-middleware');
import webpackHotServerMiddleware from 'webpack-hot-server-middleware';

import getWebpackConfiguration, { CustomWebpackConfiguration } from '../../../webpack.config';

export const getWebpackConfigurationOfType = (
	name: 'server' | 'client',
	webpack_configuration?: CustomWebpackConfiguration[]
): CustomWebpackConfiguration => {
	const current_webpack_configruation = webpack_configuration || getWebpackConfiguration(process.env);

	return current_webpack_configruation.filter(element => {
		return element.name === name;
	})[0];
};

export const getPublicPath = (webpack_configuration?: CustomWebpackConfiguration): string => {
	if (!webpack_configuration) {
		webpack_configuration = getWebpackConfigurationOfType('client');
	}
	if (webpack_configuration.output && webpack_configuration.output.publicPath && typeof webpack_configuration.output.publicPath === 'string') {
		return webpack_configuration.output.publicPath;
	} else {
		throw new Error('Cannot find publicPath in webpack configuration (or it is not of string type)')
	}
};

export const initDevMiddleware = (app: express.Express) => {
	const webpack_configuration = getWebpackConfiguration(process.env);

	const compiler = webpack(webpack_configuration);
	const client_compiler = compiler.compilers.find(current_compiler => current_compiler.name === 'client');

	app.use(webpackDevMiddleware(compiler as any, {
		publicPath: getPublicPath(getWebpackConfigurationOfType('client', webpack_configuration)),
		serverSideRender: true
	}));


	// NOTE: Only the client bundle needs to be passed to`webpack-hot-middleware`.
	if (client_compiler) {
		app.use(webpackHotMiddleware(client_compiler, {}));
	}

	app.use(webpackHotServerMiddleware(compiler));

	return app;
};