const Category = require("../models/Category");
const Product = require("../models/Product");
const File = require("../models/File");

const { formatPrice, date } = require("../../lib/utils");

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
      const keys = Object.keys(req.body);

      for (key of keys) {
        if (req.body[key] == "") return res.send("Preencha todos os campos!");
      }

      if (req.files.length == 0) {
        return res.send("Por favor, envie pelo menos uma imagem");
      }

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
        File.create({ ...file, product_id })
      );
      await Promise.all(filesPromise);

      return res.redirect(`products/${product_id}/edit`);
    } catch (err) {
      console.error(err);
    }
  },
  async show(req, res) {
    try {
      const product = await Product.find(req.params.id);

      if (!product) return res.send("Produto não encontrado!");

      const { day, hour, minutes, month } = date(product.updated_at);

      product.published = {
        day: `${day}/${month}`,
        hour: `${hour}h${minutes}`,
      };

      product.old_price = formatPrice(product.old_price);
      product.price = formatPrice(product.price);

      let files = await Product.files(product.id);
      files = files.map((file) => ({
        ...file,
        src: `${req.protocol}://${req.headers.host}${file.path.replace(
          "public",
          ""
        )}`,
      }));

      return res.render("products/show", { product, files });
    } catch (err) {
      console.error(err);
    }
  },
  async edit(req, res) {
    try {
      let product = await Product.find(req.params.id);

      if (!product) return res.send("Product not found!");

      product.old_price = formatPrice(product.old_price);
      product.price = formatPrice(product.price);

      const categories = await Category.findAll();

      let files = await Product.files(product.id);
      files = files.map((file) => ({
        ...file,
        src: `${req.protocol}://${req.headers.host}${file.path.replace(
          "public",
          ""
        )}`,
      }));

      return res.render("products/edit.njk", { product, categories, files });
    } catch (err) {
      console.error(err);
    }
  },
  async put(req, res) {
    try {
      const keys = Object.keys(req.body);

      for (key of keys) {
        if (req.body[key] == "" && key != "removed_files")
          return res.send("Preencha todos os campos!");
      }

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
        req.body.old_price = oldProduct.rows[0].price;
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
      await Product.delete(req.body.id);

      return res.redirect("/products/create");
    } catch (err) {
      console.error(err);
    }
  },
};
