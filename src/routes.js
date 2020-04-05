const express = require("express");
const routes = express.Router();

const ProductController = require("./app/controllers/ProductController");

routes.get("/", function (req, res) {
  return res.render("layout.njk");
});

routes.get("/products/create", ProductController.create);
routes.get("/products/:id/edit", ProductController.edit);
routes.post("/products", ProductController.post);
routes.put("/products", ProductController.put);
routes.delete("/products", ProductController.delete);

// Alias
routes.get("/ads/create", function (req, res) {
  return res.redirect("/products/create");
});

module.exports = routes;
