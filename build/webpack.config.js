const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const autoprefixer = require('autoprefixer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');


let templates = [];
let dir = 'src';
let files = fs.readdirSync(dir);

files.forEach(file => {
    if (file.match(/\.pug$/)) {
        let filename = file.substring(0, file.length - 4);
        templates.push(
            new HtmlWebpackPlugin({
                template: dir + '/' + filename + '.pug',
                filename: filename + '.html',
            })
        );
    }
});

module.exports = (env) => {
    return{
        mode: env || 'production',
        optimization: {
            minimizer: [
                new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})
            ]
        },
        entry: './src/app.js',
        output: {
            path: path.resolve(__dirname, '../dist'),
            filename: env !== 'production' ? 'js/app.js': 'js/app.min.js',
        },
        devtool: env !== 'production' ? "source-map" : '',
        devServer: {
            port: 3000,
            open: true,
            contentBase: path.join(__dirname, "../src"),
        },
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                },
                {
                    test: /\.(jpg|png|gif)$/,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                name: '[name].[ext]',
                                outputPath: 'static/',
                                useRelativePath: true,
                            }
                        },
                        {
                            loader: 'image-webpack-loader',
                            options: {
                                mozjpeg: {
                                    progressive: true,
                                    quality: 65
                                },
                                optipng: {
                                    enabled: true,
                                },
                                pngquant: {
                                    quality: '65-90',
                                    speed: 4
                                },
                                gifsicle: {
                                    interlaced: false,
                                },
                                webp: {
                                    quality: 75
                                }
                            }
                        }
                    ]
                },
                {
                    test: /\.pug$/,
                    use: env !== 'production' ? ["html-loader?minimize=false", "pug-html-loader?pretty=true"] : ["html-loader", "pug-html-loader"] ,
                },
                {
                    test: /\.(scss|css)$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                publicPath: '../'
                            }
                        },

                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: env !== 'production',
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                autoprefixer: {
                                    browser: ["last 2 versions"]
                                },
                                sourceMap: env !== 'production',
                                plugins: () => [
                                    autoprefixer
                                ]
                            }
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: env !== 'production'
                            }
                        }
                    ]
                }
            ],
        },
        plugins: [
            ...templates,
            new CleanWebpackPlugin(),
            new HtmlWebpackPugPlugin(),
            new MiniCssExtractPlugin({
                filename: env !== 'production' ? "css/[name]-styles.css" : "css/[name]-styles.min.css",
                chunkFilename: "[id].css"
            }),
        ]
    }
};