const Product = require("../models/Product");
const LoadProductService = require("../services/LoadProductService");

const { formatPrice } = require("../../lib/utils");

module.exports = {
  async index(req, res) {
    try {
      const allProducts = await LoadProductService.load("products");
      const products = allProducts.filter((product, index) =>
        index > 2 ? false : true
      );

      return res.render("home/index", { products });
    } catch (err) {
      console.error(err);
    }
  },
};
