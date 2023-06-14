const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

// The `/api/tags` endpoint

// get all tags
router.get("/", async (req, res) => {
  try {
    const tags = await Tag.findAll({
      include: [{ model: Product, through: ProductTag }],
    });
    res.status(200).json(tags);
  } catch (err) {
    res.status(500).json(err);
  }
});

// find a single tag by its `id`
router.get("/:id", async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag }],
    });
    res.status(200).json(tag);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create a new tag
router.post("/", (req, res) => {
  Tag.create(req.body)
    .then((tag) => {
      // if there're products, we need to create pairings to bulk create in the ProductTag model
      if (req.body.productIds.length) {
        const productIdArr = req.body.productIds.map((product_id) => {
          return {
            product_id: product_id,
            tag_id: tag.id,
          };
        });
        return ProductTag.bulkCreate(productIdArr);
      }
      // if no products, just respond
      res.status(200).json(tag);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update a tag's name by its `id` value
router.put("/:id", (req, res) => {
  // Request body will look like this
  // { tag_name: "new name", productIds: [1, 2] }
  Tag.update(
    {
      tag_name: req.body.tag_name,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  )
    .then((tag) => {
      if (req.body.productIds && req.body.productIds.length) {
        ProductTag.findAll({
          where: { tag_id: req.params.id },
        }).then((productTags) => {
          // create filtered list of new product_ids
          const productTagIds = productTags.map(({ product_id }) => product_id);
          const newProductTags = req.body.productIds
            .filter((product_id) => !productTagIds.includes(product_id))
            .map((product_id) => {
              return {
                product_id,
                tag_id: req.params.id,
              };
            });

          // figure out which ones to remove
          const productTagsToRemove = productTags
            .filter(
              ({ product_id }) => !req.body.productIds.includes(product_id)
            )
            .map(({ id }) => id);
          // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(tag);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

// delete on tag by its `id` value
router.delete("/:id", (req, res) => {
  Tag.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then(() => {
      return ProductTag.destroy({
        where: {
          tag_id: req.params.id,
        },
      });
    })
    .then((tag) => res.json(tag))
    .catch((err) => res.json(err));
});

module.exports = router;
