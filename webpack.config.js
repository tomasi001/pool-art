const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin"); // Import HtmlWebpackPlugin

module.exports = {
  // Set the mode to 'development' for unminified output. Change to 'production' for minified output.
  mode: "development",

  // Entry point of your application
  entry: "./src/index.ts",

  // Output configuration
  output: {
    filename: "bundle.js", // Name of the output bundle
    path: path.resolve(__dirname, "dist"), // Output directory
  },

  // Enable source maps for debugging
  devtool: "source-map",

  // Module resolution settings
  resolve: {
    extensions: [".ts", ".tsx", ".js"], // Resolve TypeScript and JavaScript files
  },

  // Module rules to handle different file types
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Match .ts and .tsx files
        use: "ts-loader", // Use ts-loader for TypeScript files
        exclude: /node_modules/, // Exclude node_modules directory
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(glsl|vs|fs)$/, // Match shader files with .glsl, .vs, .fs extensions
        use: "raw-loader", // Use raw-loader to import shader files as strings
        exclude: /node_modules/, // Exclude node_modules directory
      },
      // Optional: If using glslify, include glslify-loader
      // {
      //   test: /\.(glsl|vs|fs)$/,
      //   use: ['raw-loader', 'glslify-loader'],
      //   exclude: /node_modules/,
      // },
    ],
  },

  // Development server configuration
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"), // Serve static files from 'dist' directory
    },
    compress: true, // Enable gzip compression
    port: 9000, // Port to run the server on
    open: true, // Open the browser after server has been started
  },

  // Plugins (add any required plugins here)
  plugins: [
    // Example: Automatically generate an index.html file with the script tag.
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
    }),
  ],
};
