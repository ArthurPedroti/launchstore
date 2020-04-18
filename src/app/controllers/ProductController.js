const { unlinkSync } = require("fs");

const Category = require("../models/Category");
const Product = require("../models/Product");
const File = require("../models/File");
const LoadProductService = require("../services/LoadProductService");

module.exports = {
  async create(req, res) {
    try {
      const categories = await Category.findAll();
      return res.render("products/create", { categories });
    } catch (err) {
      console.error(err);
    }
  },
  async post(req, res) {
    try {
      let {
        category_id,
        name,
        description,
        old_price,
        price,
        quantity,
        status,
      } = req.body;

      price = price.replace(/\D/g, "");

      const product_id = await Product.create({
        category_id,
        user_id: req.session.userId,
        name,
        description,
        old_price: old_price || price,
        price,
        quantity,
        status: status || 1,
      });

      const filesPromise = req.files.map((file) =>
        File.create({ name: file.filename, path: file.path, product_id })
      );
      await Promise.all(filesPromise);

      return res.redirect(`products/${product_id}/edit`);
    } catch (err) {
      console.error(err);
    }
  },
  async show(req, res) {
    try {
      const product = await LoadProductService.load("product", {
        where: { id: req.params.id },
      });

      if (!product) return res.send("Produto não encontrado!");

      return res.render("products/show", { product });
    } catch (err) {
      console.error(err);
    }
  },
  async edit(req, res) {
    try {
      const product = await LoadProductService.load("product", {
        where: { id: req.params.id },
      });

      const categories = await Category.findAll();

      return res.render("products/edit.njk", { product, categories });
    } catch (err) {
      console.error(err);
    }
  },
  async put(req, res) {
    try {
      if (req.files.length != 0) {
        const newFilesPromise = req.files.map((file) =>
          File.create({ ...file, product_id: req.body.id })
        );
        await Promise.all(newFilesPromise);
      }

      if (req.body.removed_files) {
        const removedFiles = req.body.removed_files.split(",");
        const lastIndex = removedFiles.length - 1;
        removedFiles.splice(lastIndex, 1);

        const removedFilesPromise = removedFiles.map((id) => File.delete(id));

        await Promise.all(removedFilesPromise);
      }

      req.body.price = req.body.price.replace(/\D/g, "");
      req.body.old_price = req.body.old_price.replace(/\D/g, "");

      if (req.body.old_price != req.body.price) {
        const oldProduct = await Product.find(req.body.id);
        req.body.old_price = oldProduct.price;
      }

      const {
        id,
        category_id,
        name,
        description,
        old_price,
        price,
        quantity,
        status,
      } = req.body;

      await Product.update(id, {
        category_id,
        name,
        description,
        old_price,
        price,
        quantity,
        status,
      });

      return res.redirect(`/products/${req.body.id}/edit`);
    } catch (err) {
      console.error(err);
    }
  },
  async delete(req, res) {
    try {
      //pick all images
      const files = await Product.files(req.body.id);

      await Product.delete(req.body.id);

      //remove images form public
      files.map((file) => {
        try {
          unlinkSync(file.path);
        } catch (err) {
          console.error(err);
        }
      });

      return res.redirect("/products/create");
    } catch (err) {
      console.error(err);
    }
  },
};
