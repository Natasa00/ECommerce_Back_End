const router = require("express").Router();
const { Category, Product } = require("../../models");

// The `/api/categories` endpoint

// get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json(err);
  }
});

// find one category by its `id` value
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
    });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create a category
router.post("/", (req, res) => {
  Category.create(req.body)
    .then((category) => {
      res.status(200).json(category);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update a category by its `id` value
router.put("/:id", (req, res) => {
  Category.update(
    {
      category_name: req.body.category_name,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  )
    .then((category) => {
      res.status(200).json(category);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// delete a category by its `id` value
router.delete("/:id", (req, res) => {
  Product.destroy({
    where: {
      category_id: req.params.id
    }
  })
  Category.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((category) => res.json(category))
    .catch((err) => res.json(err));
});

module.exports = router;
