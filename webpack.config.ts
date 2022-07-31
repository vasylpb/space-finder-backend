import { Configuration } from "webpack";
import { resolve } from "path";

const config: Configuration = {
  mode: "none",
  entry: {
    nodeHelloLambda: "./services/node-lambda/hello.ts",
  },
  target: "node",
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    libraryTarget: "commonjs2",
    path: resolve(__dirname, "build"),
    filename: "[name].js",
  },
  externals: {
    "aws-cdk": "aws-cdk",
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: "tsconfig.webpack.json",
          },
        },
      },
    ],
  },
};

export default config;
